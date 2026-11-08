// Stage 1 — keyword/brief agent. For each approved keyword without a brief, ask the LLM for an outline.
import fs from 'node:fs';
import path from 'node:path';
import { getProvider, parseJsonLoose } from './llm';
import { briefPrompt, SYSTEM_BRIEF } from './prompts';
import { BRIEF_DIR, factsFor, INTERNAL_ROUTES, isMain, loadKeywords, argValue } from './common';
import type { Brief, KeywordEntry } from './types';

export async function makeBrief(k: KeywordEntry): Promise<Brief> {
  const facts = factsFor(k);
  const llm = getProvider('writer');
  const raw = await llm.complete({
    task: 'brief', system: SYSTEM_BRIEF, user: briefPrompt(k, facts, INTERNAL_ROUTES), json: true, temperature: 0.3,
    context: { keyword: k.keyword, facts },
  });
  const b = parseJsonLoose<Omit<Brief, 'id' | 'keyword'>>(raw);
  if (!b.title || !Array.isArray(b.outline) || b.outline.length < 3) throw new Error(`Brief for ${k.id} is malformed`);
  const brief: Brief = { id: k.id, keyword: k.keyword, ...b, internal_links: (b.internal_links ?? []).filter((l) => INTERNAL_ROUTES.includes(l)) };
  fs.mkdirSync(BRIEF_DIR, { recursive: true });
  fs.writeFileSync(path.join(BRIEF_DIR, `${k.id}.json`), JSON.stringify(brief, null, 2) + '\n');
  return brief;
}

if (isMain(import.meta.url)) {
  const only = argValue('id');
  const todo = loadKeywords().filter((k) => k.status === 'approved' && (!only || k.id === only))
    .filter((k) => only || !fs.existsSync(path.join(BRIEF_DIR, `${k.id}.json`)));
  for (const k of todo) {
    const b = await makeBrief(k);
    console.log(`brief: ${k.id} → "${b.title}"`);
  }
  if (!todo.length) console.log('No approved keywords need a brief.');
}
