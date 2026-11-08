// Shared building blocks for the guide pages. Server-safe (no hooks).
import type { ReactNode } from 'react';
import { Avatar } from '../Avatar';
import type { Persona } from '@/lib/extras';

export function Story({ avatar, name, sub, beats }: { avatar: Persona['avatar']; name: string; sub: string; beats: { emoji: string; text: ReactNode }[] }) {
  return (
    <div className="story">
      <div className="story-head">
        <Avatar a={avatar} size={52} />
        <div><b>{name}</b><div className="muted small">{sub}</div></div>
      </div>
      <ul className="story-beats">
        {beats.map((b, i) => <li key={i}><span className="emoji" aria-hidden="true">{b.emoji}</span><span>{b.text}</span></li>)}
      </ul>
    </div>
  );
}

export function Steps({ items }: { items: { title: string; text: string }[] }) {
  return <ol className="steps">{items.map((s) => <li key={s.title}><b>{s.title}</b><span>{s.text}</span></li>)}</ol>;
}

export function Watch({ items }: { items: { emoji: string; title: string; text: string }[] }) {
  return (
    <ul className="watch">
      {items.map((w) => <li key={w.title}><span className="emoji" aria-hidden="true">{w.emoji}</span><span><b>{w.title}</b>{w.text}</span></li>)}
    </ul>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.map((f) => <details key={f.q}><summary>{f.q}</summary><div>{f.a}</div></details>)}
    </div>
  );
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export const rm = (n: number, dp = 0) => 'RM' + n.toLocaleString('en-MY', { minimumFractionDigits: dp, maximumFractionDigits: dp });
