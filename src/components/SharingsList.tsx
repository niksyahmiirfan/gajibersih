'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { SharingMeta } from '@/lib/content';

const L = {
  en: { all: 'All', min: 'min read', none: 'No posts in this category yet.', filter: 'Filter by category', cats: {} as Record<string, string>, english: '' },
  ms: { all: 'Semua', min: 'minit bacaan', none: 'Belum ada artikel dalam kategori ini.', filter: 'Tapis mengikut kategori',
    cats: { FAQ: 'Soalan lazim', 'Saving tips': 'Tip menyimpan', Updates: 'Kemas kini' } as Record<string, string>, english: 'English' },
};

export function SharingsList({ posts, categories, locale = 'en' }: { posts: SharingMeta[]; categories: readonly string[]; locale?: 'en' | 'ms' }) {
  const l = L[locale];
  const label = (c: string) => l.cats[c] ?? c;
  const [cat, setCat] = useState<string>('All');
  const shown = cat === 'All' ? posts : posts.filter((p) => p.category === cat);
  return (
    <>
      <div className="filter-row" role="group" aria-label={l.filter}>
        {['All', ...categories].map((c) => (
          <button key={c} type="button" aria-pressed={c === cat} onClick={() => setCat(c)}>{c === 'All' ? l.all : label(c)}</button>
        ))}
      </div>
      {shown.length ? (
        <ul className="posts">
          {shown.map((p) => (
            <li key={p.slug}>
              <Link href={`/sharings/${p.slug}/`} className="post-card">
                <span className="tag">{label(p.category)}{l.english ? ` · ${l.english}` : ''}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <span className="post-meta">{p.date} · {p.readingMinutes} {l.min}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="muted">{l.none}</p>}
    </>
  );
}
