// Stage 3 — writer agent. Drafts from brief + FACTS (calculator output). Numbers never come from the model.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getProvider } from './llm';
import { draftPrompt, SYSTEM_WRITER } from './prompts';
import { BRIEF_DIR, contentPath, factsFor, isMain, loadKeywords, argValue } from './common';
import type { Brief, KeywordEntry } from './types';

function cleanMarkdown(text: string) {
  let t = text.trim();
  const fence = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/m.exec(t);
  if (fence && t.startsWith('```')) t = fence[1].trim();
  const fm = t.indexOf('---');
  return fm > 0 ? t.slice(fm) : t;
}

export async function makeDraft(k: KeywordEntry): Promise<string> {
  const brief = JSON.parse(fs.readFileSync(path.join(BRIEF_DIR, `${k.id}.json`), 'utf8')) as Brief;
  const facts = factsFor(k);
  const llm = getProvider('writer');
  const raw = await llm.complete({ task: 'draft', system: SYSTEM_WRITER, user: draftPrompt(brief, facts), temperature: 0.5, context: { facts, brief } });

  const parsed = matter(cleanMarkdown(raw));
  const data = {
    title: parsed.data.title || brief.title,
    description: parsed.data.description || brief.description,
    updated: facts.asOf,
    data_year: facts.year,
    keyword: k.keyword,
    faqs: parsed.data.faqs ?? [],
    sources: parsed.data.sources ?? Object.values(facts.sources),
    generated_by: `${llm.name}/${llm.model}`,
    review_status: 'needs-human-review',
  };
  const out = contentPath(k);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, matter.stringify(parsed.content.trim() + '\n', data));
  return out;
}

if (isMain(import.meta.url)) {
  const only = argValue('id');
  const todo = loadKeywords().filter((k) => k.status === 'approved' && (!only || k.id === only))
    .filter((k) => fs.existsSync(path.join(BRIEF_DIR, `${k.id}.json`)) && (only || !fs.existsSync(contentPath(k))));
  for (const k of todo) console.log(`draft: ${k.id} → ${path.relative(process.cwd(), await makeDraft(k))}`);
  if (!todo.length) console.log('Nothing to draft (need an approved keyword with a brief and no existing article).');
}
