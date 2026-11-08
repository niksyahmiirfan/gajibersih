'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { FunFact as Fact } from '@/lib/extras';

const LABEL = {
  en: { fact: 'Fun fact', tip: 'Money tip', proverb: 'Saying', quote: 'Quote of the day', another: 'Show another', close: 'Hide for today' },
  ms: { fact: 'Fakta menarik', tip: 'Tip kewangan', proverb: 'Peribahasa', quote: 'Kata-kata hari ini', another: 'Tunjuk lain', close: 'Sembunyi untuk hari ini' },
};
const ICON = { fact: '💡', tip: '🪙', proverb: '🌱', quote: '💬' };

/** Daily banner. Picked in the browser (Malaysia date) so it changes every day without a rebuild. */
export function FunFact({ facts }: { facts: Fact[] }) {
  const locale = usePathname()?.startsWith('/ms') ? 'ms' : 'en';
  const [i, setI] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);
  const today = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);

  useEffect(() => {
    const d = today();
    try { if (localStorage.getItem('funfact-hidden') === d) { setHidden(true); return; } } catch { /* ignore */ }
    const dayNum = Math.floor(Date.parse(d) / 86_400_000);
    setI(dayNum % facts.length);
  }, [facts.length]);

  if (hidden || i === null || !facts.length) return null;
  const f = facts[i];
  const L = LABEL[locale];
  return (
    <aside className="funfact" aria-live="polite">
      <span className="funfact-kind"><span aria-hidden="true">{ICON[f.kind]}</span> {L[f.kind]}</span>
      <span className="funfact-text" key={i}>{f[locale]}</span>
      <span className="funfact-actions">
        <button type="button" className="icon-btn sm" onClick={() => setI((i + 1) % facts.length)} aria-label={L.another} title={L.another}>↻</button>
        <button type="button" className="icon-btn sm" aria-label={L.close} title={L.close}
          onClick={() => { setHidden(true); try { localStorage.setItem('funfact-hidden', today()); } catch { /* ignore */ } }}>✕</button>
      </span>
    </aside>
  );
}
