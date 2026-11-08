'use client';
import { useEffect, useRef, useState } from 'react';
import { cardPayoff } from '@/engine/finance';
import type { Loc } from '@/lib/routes';

const T = {
  en: {
    title: 'The minimum-payment race', sub: 'Same balance, two ways to pay it off. No new spending.',
    balance: 'Card balance', rate: 'Interest rate', fixed: 'Your fixed monthly payment',
    tiers: [['15%', 'Paid on time 12/12 months'], ['17%', '10–11 of 12'], ['18%', 'Fewer than 10']],
    minLabel: 'Minimum only (5% or RM50)', fixedLabel: 'Fixed', months: 'months', interest: 'interest', never: 'Never ends: payment is below the interest',
    takeaway: 'Paying a fixed amount saves {x} and finishes {m} months sooner.',
  },
  ms: {
    title: 'Perlumbaan bayaran minimum', sub: 'Baki sama, dua cara melangsaikannya. Tiada belanja baharu.',
    balance: 'Baki kad', rate: 'Kadar faedah', fixed: 'Bayaran tetap bulanan anda',
    tiers: [['15%', 'Bayar tepat 12/12 bulan'], ['17%', '10–11 daripada 12'], ['18%', 'Kurang daripada 10']],
    minLabel: 'Minimum sahaja (5% atau RM50)', fixedLabel: 'Tetap', months: 'bulan', interest: 'faedah', never: 'Tak akan habis: bayaran lebih rendah daripada faedah',
    takeaway: 'Bayaran tetap menjimatkan {x} dan habis {m} bulan lebih awal.',
  },
};
const rm = (n: number) => 'RM' + Math.round(n).toLocaleString('en-MY');

export function PayoffRace({ locale }: { locale: Loc }) {
  const t = T[locale];
  const [balance, setBalance] = useState(3000);
  const [apr, setApr] = useState(18);
  const [fixed, setFixed] = useState(300);
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const min = cardPayoff(balance, apr, { kind: 'minimum' });
  const fix = cardPayoff(balance, apr, { kind: 'fixed', amount: fixed });
  const maxMonths = Math.max(min.months, fix.neverEnds ? 0 : fix.months, 1);
  const width = (m: number) => (go ? `${Math.max(8, (m / maxMonths) * 100)}%` : '0%');

  return (
    <div className="tool" ref={ref}>
      <div className="inputs" style={{ gap: 16 }}>
        <div><h3 style={{ margin: 0 }}>{t.title}</h3><p className="muted small" style={{ margin: '4px 0 0' }}>{t.sub}</p></div>
        <label className="field">
          <span className="field-row">{t.balance}<output>{rm(balance)}</output></span>
          <input type="range" min={500} max={20000} step={100} value={balance} onChange={(e) => setBalance(+e.target.value)} />
        </label>
        <div className="field">
          <span>{t.rate}</span>
          <div className="seg-choice">
            {t.tiers.map(([r, label]) => (
              <button key={r} type="button" aria-pressed={apr === parseFloat(r)} onClick={() => setApr(parseFloat(r))} title={label}>{r}</button>
            ))}
          </div>
          <span className="small-print">{t.tiers.find(([r]) => parseFloat(r) === apr)![1]}</span>
        </div>
        <label className="field">
          <span className="field-row">{t.fixed}<output>{rm(fixed)}</output></span>
          <input type="range" min={50} max={2000} step={10} value={fixed} onChange={(e) => setFixed(+e.target.value)} />
        </label>
      </div>
      <div>
        <div className="race">
          <div className="race-row">
            <div className="race-label"><span>🐢 {t.minLabel}</span><b>{min.months} {t.months}</b></div>
            <div className="race-track"><div className="race-fill" style={{ width: width(min.months), background: 'var(--s3)' }} /></div>
            <div className="race-sub">{rm(min.totalInterest)} {t.interest}</div>
          </div>
          <div className="race-row">
            <div className="race-label"><span>🐇 {t.fixedLabel} {rm(fixed)}</span><b>{fix.neverEnds ? '∞' : `${fix.months} ${t.months}`}</b></div>
            <div className="race-track">
              {fix.neverEnds
                ? <div className="small-print" style={{ padding: '4px 8px' }}>{t.never}</div>
                : <div className="race-fill" style={{ width: width(fix.months), background: 'var(--s1)' }} />}
            </div>
            {!fix.neverEnds && <div className="race-sub">{rm(fix.totalInterest)} {t.interest}</div>}
          </div>
        </div>
        {!fix.neverEnds && min.totalInterest > fix.totalInterest && (
          <p className="callout" style={{ marginTop: 14 }}>
            💡 {t.takeaway.replace('{x}', rm(min.totalInterest - fix.totalInterest)).replace('{m}', String(min.months - fix.months))}
          </p>
        )}
      </div>
    </div>
  );
}
