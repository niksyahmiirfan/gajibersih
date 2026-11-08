'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { SharingMeta } from '@/lib/content';

export function SharingsList({ posts, categories }: { posts: SharingMeta[]; categories: readonly string[] }) {
  const [cat, setCat] = useState<string>('All');
  const shown = cat === 'All' ? posts : posts.filter((p) => p.category === cat);
  return (
    <>
      <div className="filter-row" role="group" aria-label="Filter by category">
        {['All', ...categories].map((c) => (
          <button key={c} type="button" aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {shown.length ? (
        <ul className="posts">
          {shown.map((p) => (
            <li key={p.slug}>
              <Link href={`/sharings/${p.slug}/`} className="post-card">
                <span className="tag">{p.category}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <span className="post-meta">{p.date} · {p.readingMinutes} min read</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="muted">No posts in this category yet.</p>}
    </>
  );
}
