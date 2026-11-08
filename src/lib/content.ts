// Loads pipeline-written markdown (content/<locale>/<section>/<id>.md) at build time.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface ContentDoc {
  title: string;
  description: string;
  updated: string;
  html: string;
  faqs: { q: string; a: string }[];
  sources: string[];
}

export const SHARING_CATEGORIES = ['FAQ', 'Saving tips', 'Updates'] as const;

export interface SharingMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingMinutes: number;
}

/** All published Sharings posts (content/en/sharings/*.md), newest first. `draft: true` posts are skipped. */
export function listSharings(locale = 'en'): SharingMeta[] {
  const dir = path.join(process.cwd(), 'content', locale, 'sharings');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
    return {
      slug: f.replace(/\.md$/, ''),
      title: data.title ?? '',
      description: data.description ?? '',
      date: data.date ? String(data.date instanceof Date ? data.date.toISOString() : data.date).slice(0, 10) : '',
      category: data.category ?? 'Updates',
      readingMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 200)),
      draft: !!data.draft,
    };
  }).filter((p) => !p.draft).map(({ draft: _d, ...p }) => p).sort((a, b) => b.date.localeCompare(a.date));
}

export function loadContent(locale: string, section: string, id: string): ContentDoc | null {
  const file = path.join(process.cwd(), 'content', locale, section, `${id}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  return {
    title: data.title ?? '',
    description: data.description ?? '',
    updated: data.updated ? String(data.updated).slice(0, 10) : '',
    html: marked.parse(content, { async: false }) as string,
    faqs: data.faqs ?? [],
    sources: data.sources ?? [],
  };
}
