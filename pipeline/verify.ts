// Stage 4 — verifier. Deterministic checks first (these gate the PR), optional LLM claim check as warnings.
// Usage: tsx pipeline/verify.ts [files...] [--report report.md]   (no files = all content/**/*.md)
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { allowedNumbers, buildFacts, type Facts } from './facts';
import { argValue, INTERNAL_ROUTES, isMain, OFFICIAL_DOMAINS, ROOT } from './common';
import { getProvider, parseJsonLoose } from './llm';
import { claimsPrompt, SYSTEM_CLAIMS } from './prompts';

export interface Finding { level: 'error' | 'warn'; check: string; message: string }
export interface FileReport { file: string; words: number; findings: Finding[] }

const MIN_WORDS = Number(process.env.VERIFY_MIN_WORDS || 350);

export function factsForFile(file: string): Facts {
  const m = /content\/[a-z]{2}\/salary\/(\d+)\.md$/.exec(file.replace(/\\/g, '/'));
  return m ? buildFacts({ type: 'salary', salary: Number(m[1]) }) : buildFacts({ type: 'guide' });
}

const parseNum = (s: string) => Number(s.replace(/,/g, ''));

/** Pull every RM amount and percentage out of text. */
export function extractNumbers(text: string) {
  const rm = [...text.matchAll(/RM\s?(\d[\d,]*(?:\.\d+)?)(\s?k\b)?/gi)].map((m) => ({ raw: m[0], value: parseNum(m[1]) * (m[2] ? 1000 : 1) }));
  const pct = [...text.matchAll(/(\d+(?:\.\d+)?)\s?(%|percent)/gi)].map((m) => ({ raw: m[0], value: parseNum(m[1]) }));
  return [...rm, ...pct];
}

export function numberSupported(v: number, allowed: Set<number>) {
  for (const a of allowed) {
    if (Math.abs(a - v) < 0.006) return true;
    if (Number.isInteger(v) && Math.abs(a - v) < 1) return true; // "about RM4,270" for 4,270.25
  }
  return false;
}

function shingles(text: string, n = 5) {
  const w = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const s = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' '));
  return s;
}
const jaccard = (a: Set<string>, b: Set<string>) => {
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

export function listContentFiles(): string[] {
  const dir = path.join(ROOT, 'content');
  const out: string[] = [];
  const walk = (d: string) => { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== 'briefs') walk(p); } else if (f.endsWith('.md')) out.push(p);
  } };
  walk(dir);
  return out;
}

export function verifyFile(file: string, others: string[] = []): FileReport {
  const findings: Finding[] = [];
  const add = (level: Finding['level'], check: string, message: string) => findings.push({ level, check, message });
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const facts = factsForFile(file);
  const allowed = allowedNumbers(facts);
  const isSharing = /content\/[a-z]{2}\/sharings\//.test(file.replace(/\\/g, '/'));
  // Posts may list extra figures (e.g. 50/30/20) that a human reviewer has checked
  for (const n of (data.allowed_numbers ?? []) as number[]) allowed.add(Math.round(Number(n) * 100) / 100);
  if (isSharing) {
    if (!data.date) add('error', 'frontmatter', 'sharings post needs a date');
    if (!data.category) add('error', 'frontmatter', 'sharings post needs a category');
  }

  // Frontmatter
  if (!data.title) add('error', 'frontmatter', 'missing title');
  else if (String(data.title).length > 70) add('warn', 'frontmatter', `title is ${String(data.title).length} chars (>70)`);
  const dl = String(data.description ?? '').length;
  if (dl < 50 || dl > 165) add('warn', 'frontmatter', `description length ${dl} (aim 120–155)`);
  if (!isSharing && (!Array.isArray(data.faqs) || data.faqs.length < 2)) add('error', 'faqs', 'need at least 2 FAQs');
  if (data.data_year && Number(data.data_year) !== facts.year) add('error', 'staleness', `written for ${data.data_year} data but current data is ${facts.year}`);

  // Sources: official domains only
  const sources: string[] = data.sources ?? [];
  if (!sources.length) add(isSharing ? 'warn' : 'error', 'sources', 'no sources listed');
  for (const s of sources) {
    try { const host = new URL(s).hostname; if (!OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith('.' + d))) add('error', 'sources', `non-official source: ${s}`); }
    catch { add('error', 'sources', `invalid URL: ${s}`); }
  }

  // Structure
  const words = content.split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS) add('error', 'length', `${words} words (< ${MIN_WORDS})`);
  const h2 = (content.match(/^##\s+/gm) || []).length;
  if (h2 < 3) add('error', 'headings', `${h2} H2 headings (need ≥ 3)`);
  if (/^#\s+/m.test(content)) add('error', 'headings', 'body contains an H1 (the page template provides it)');
  if (!/(not (financial|tax) advice|estimate)/i.test(content)) add('error', 'disclaimer', 'no estimate / not-advice disclaimer');

  // Numbers must come from FACTS
  const faqText = (data.faqs ?? []).map((f: { q: string; a: string }) => `${f.q} ${f.a}`).join('\n');
  for (const n of extractNumbers(content + '\n' + faqText)) {
    if (!numberSupported(n.value, allowed)) add('error', 'numbers', `"${n.raw}" is not in the calculator facts`);
  }

  // Links
  for (const m of content.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = m[1];
    if (href.startsWith('/')) {
      const p = href.split(/[?#]/)[0];
      if (!INTERNAL_ROUTES.includes(p.endsWith('/') ? p : p + '/')) add('error', 'links', `broken internal link ${href}`);
    } else if (!href.startsWith('https://')) add('warn', 'links', `non-https link ${href}`);
  }

  // Near-duplicate detection against other articles
  const mine = shingles(content);
  for (const o of others) {
    if (o === file) continue;
    const sim = jaccard(mine, shingles(matter(fs.readFileSync(o, 'utf8')).content));
    if (sim > 0.7) add('error', 'duplicate', `${(sim * 100).toFixed(0)}% overlap with ${path.relative(ROOT, o)}`);
    else if (sim > 0.45) add('warn', 'duplicate', `${(sim * 100).toFixed(0)}% overlap with ${path.relative(ROOT, o)}`);
  }

  return { file: path.relative(ROOT, file), words, findings };
}

export async function llmClaimCheck(file: string): Promise<Finding[]> {
  const provider = process.env.LLM_VERIFY_PROVIDER || process.env.LLM_PROVIDER;
  if (!provider || provider === 'mock') return [];
  const llm = getProvider('verifier');
  const raw = await llm.complete({ task: 'claims', system: SYSTEM_CLAIMS, user: claimsPrompt(fs.readFileSync(file, 'utf8'), factsForFile(file)), json: true, temperature: 0 });
  const { issues = [] } = parseJsonLoose<{ issues: { claim: string; reason: string }[] }>(raw);
  return issues.map((i) => ({ level: 'warn' as const, check: 'llm-claims', message: `${i.claim} — ${i.reason}` }));
}

export function toMarkdown(reports: FileReport[]) {
  const lines = ['## Content verification', ''];
  for (const r of reports) {
    const errs = r.findings.filter((f) => f.level === 'error').length;
    const warns = r.findings.length - errs;
    lines.push(`### ${errs ? '❌' : '✅'} \`${r.file}\` — ${r.words} words, ${errs} errors, ${warns} warnings`);
    for (const f of r.findings) lines.push(`- **${f.level}** [${f.check}] ${f.message}`);
    lines.push('');
  }
  lines.push('_Reviewer checklist: read the intro and worked example, check tone, confirm nothing claims personal experience._');
  return lines.join('\n');
}

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--report');
  const all = listContentFiles();
  const files = args.length ? args.map((a) => path.resolve(a)) : all;
  const reports: FileReport[] = [];
  for (const f of files) {
    const r = verifyFile(f, all);
    try { r.findings.push(...(await llmClaimCheck(f))); } catch (e) { r.findings.push({ level: 'warn', check: 'llm-claims', message: `skipped: ${String(e).slice(0, 120)}` }); }
    reports.push(r);
  }
  const md = toMarkdown(reports);
  const reportPath = argValue('report');
  if (reportPath) fs.writeFileSync(reportPath, md);
  console.log(md);
  const failed = reports.some((r) => r.findings.some((f) => f.level === 'error'));
  process.exit(failed ? 1 : 0);
}
