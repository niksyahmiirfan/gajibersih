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
