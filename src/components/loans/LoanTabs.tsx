'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { track } from '../analytics';

/** Car | Home switcher. Both panels are in the HTML (good for search); #car / #home deep-links. */
export function LoanTabs({ labels, car, home }: { labels: [string, string]; car: ReactNode; home: ReactNode }) {
  const [tab, setTab] = useState<'car' | 'home'>('car');
  useEffect(() => { if (location.hash === '#home') setTab('home'); }, []);
  const pick = (t: 'car' | 'home') => {
    setTab(t);
    history.replaceState(null, '', `#${t}`);
    track('loan_tab', { tab: t });
  };
  return (
    <>
      <div className="pill-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'car'} aria-controls="panel-car" onClick={() => pick('car')}>🚗 {labels[0]}</button>
        <button type="button" role="tab" aria-selected={tab === 'home'} aria-controls="panel-home" onClick={() => pick('home')}>🏠 {labels[1]}</button>
      </div>
      <div id="panel-car" role="tabpanel" hidden={tab !== 'car'}>{car}</div>
      <div id="panel-home" role="tabpanel" hidden={tab !== 'home'}>{home}</div>
    </>
  );
}
