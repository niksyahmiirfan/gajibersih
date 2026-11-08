import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { pathToFileURL } from 'node:url';
import type { KeywordEntry } from './types';
import { buildFacts } from './facts';
import { CLUSTER_SALARIES, salarySlug } from '../src/lib/site';

export const ROOT = process.cwd();
export const KEYWORDS_FILE = path.join(ROOT, 'pipeline', 'keywords.yaml');
export const BRIEF_DIR = path.join(ROOT, 'content', 'briefs');

export const loadKeywords = () => yaml.load(fs.readFileSync(KEYWORDS_FILE, 'utf8')) as KeywordEntry[];
export function saveKeywords(list: KeywordEntry[]) {
  const header = fs.readFileSync(KEYWORDS_FILE, 'utf8').split('\n').filter((l) => l.startsWith('#')).join('\n');
  fs.writeFileSync(KEYWORDS_FILE, header + '\n' + yaml.dump(list, { lineWidth: 120 }));
}

export function contentPath(k: KeywordEntry, locale = 'en') {
  if (k.type === 'salary') return path.join(ROOT, 'content', locale, 'salary', `${k.salary}.md`);
  return path.join(ROOT, 'content', locale, k.section ?? 'guides', `${k.id}.md`);
}

export const factsFor = (k: KeywordEntry) =>
  buildFacts(k.type === 'salary' ? { type: 'salary', salary: k.salary! } : { type: 'guide' });

export const INTERNAL_ROUTES = [
  '/', '/take-home-pay-calculator/', '/ms/kalkulator-gaji-bersih/', '/methodology/', '/about/', '/privacy/',
  ...CLUSTER_SALARIES.map((s) => `/salary/${salarySlug(s)}/`),
];

export const OFFICIAL_DOMAINS = ['kwsp.gov.my', 'perkeso.gov.my', 'hasil.gov.my', 'mof.gov.my', 'ssm.com.my'];

export const isMain = (metaUrl: string) => process.argv[1] && metaUrl === pathToFileURL(path.resolve(process.argv[1])).href;

export function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
