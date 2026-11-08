'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateTakeHome } from '@/engine/my/takeHome';
import type { MyRules, Residency } from '@/engine/my/types';
import { dict, type Locale } from '@/i18n/dict';
import { Breakdown } from './Breakdown';
import { track } from './analytics';
import { formatRM } from '@/engine/my/money';

export function Calculator({ rules, locale = 'en', initialSalary = 5000 }: { rules: MyRules; locale?: Locale; initialSalary?: number }) {
  const t = dict[locale];
  const [salary, setSalary] = useState(initialSalary);
  const [age, setAge] = useState(30);
  const [residency, setResidency] = useState<Residency>('citizen');
  const [taxResident, setTaxResident] = useState(true);
  const [skbbk, setSkbbk] = useState(true);
  const [spouseRelief, setSpouseRelief] = useState(false);
  const [children, setChildren] = useState(0);
  const [otherReliefs, setOtherReliefs] = useState(0);

  // ?salary=4500 deep links
  useEffect(() => {
    const s = Number(new URLSearchParams(window.location.search).get('salary'));
    if (s > 0) setSalary(s);
  }, []);

  const r = useMemo(
    () => calculateTakeHome({ monthlySalary: salary, age, residency, taxResident, skbbk, spouseRelief, children, otherReliefsAnnual: otherReliefs }, rules),
    [salary, age, residency, taxResident, skbbk, spouseRelief, children, otherReliefs, rules],
  );

  // One analytics event per settled calculation (debounced) — feeds the "calculations" metric.
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => track('calculate', { tool: 'take_home_my', salary_band: Math.floor(salary / 1000) * 1000, locale }), 1500);
    return () => clearTimeout(timer.current);
  }, [r, salary, locale]);

  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(Math.max(0, Number(e.target.value) || 0));

  return (
    <div className="calc">
      <div className="calc-sticky" aria-hidden="true"><span>{t.takeHome}</span><b>{formatRM(r.net)}</b></div>
      <form className="inputs" onSubmit={(e) => e.preventDefault()}>
        <label>{t.salary}
          <input type="number" inputMode="decimal" min={0} step={50} value={salary || ''} onChange={num(setSalary)} />
        </label>
        <div className="row">
          <label>{t.age}
            <input type="number" min={16} max={80} value={age} onChange={num(setAge)} />
          </label>
          <label>{t.residency}
            <select value={residency} onChange={(e) => setResidency(e.target.value as Residency)}>
              <option value="citizen">{t.citizen}</option>
              <option value="pr">{t.pr}</option>
              <option value="foreign">{t.foreign}</option>
            </select>
          </label>
        </div>
        <label className="check"><input type="checkbox" checked={taxResident} onChange={(e) => setTaxResident(e.target.checked)} /> {t.taxResident}</label>
        <label className="check"><input type="checkbox" checked={skbbk} onChange={(e) => setSkbbk(e.target.checked)} disabled={residency === 'foreign'} /> {t.skbbk}</label>
        <label className="check"><input type="checkbox" checked={spouseRelief} onChange={(e) => setSpouseRelief(e.target.checked)} /> {t.spouse}</label>
        <div className="row">
          <label>{t.children}
            <input type="number" min={0} max={20} value={children} onChange={num(setChildren)} />
          </label>
          <label>{t.otherReliefs}
            <input type="number" min={0} step={100} value={otherReliefs || ''} onChange={num(setOtherReliefs)} />
          </label>
        </div>
        <p className="muted small">{t.disclaimer} {t.lastVerified}: {rules.meta.last_verified}.</p>
      </form>
      <Breakdown r={r} t={t} />
    </div>
  );
}
