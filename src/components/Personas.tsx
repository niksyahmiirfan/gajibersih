'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateTakeHome } from '@/engine/my/takeHome';
import type { MyRules } from '@/engine/my/types';
import type { Persona } from '@/lib/extras';
import type { Locale } from '@/i18n/dict';
import { Avatar } from './Avatar';
import { track } from './analytics';

const T = {
  en: {
    title: 'Meet the payslips', sub: 'Same rules, different lives. Pick someone, then slide their salary.',
    keep: 'Of every RM100 earned, {name} keeps', takeHome: 'Take-home', epf: 'EPF', perkeso: 'SOCSO, EIS & SKBBK', tax: 'Tax',
    salary: 'Monthly salary', soundOn: 'Sound on', soundOff: 'Sound off', perMonth: '/month',
    status: { citizen: 'Warganegara', pr: 'Penduduk Tetap', foreign: 'Pekerja Asing' },
    chipForeign: 'EPF only {e}% · no EIS · SKBBK compulsory', chip60: 'Pays {e}% EPF · employer pays {r}% · no EIS',
    chipPr: 'Same EPF rates as citizens', chipRelief: 'Family reliefs save RM{x} tax a year', chipEmployer: 'Employer adds RM{x} to EPF monthly',
    age: 'age',
  },
  ms: {
    title: 'Kenali slip gaji mereka', sub: 'Peraturan sama, kehidupan berbeza. Pilih seseorang, kemudian gerakkan gajinya.',
    keep: 'Daripada setiap RM100, {name} bawa pulang', takeHome: 'Gaji bersih', epf: 'KWSP', perkeso: 'PERKESO, SIP & SKBBK', tax: 'Cukai',
    salary: 'Gaji bulanan', soundOn: 'Bunyi hidup', soundOff: 'Bunyi mati', perMonth: '/bulan',
    status: { citizen: 'Warganegara', pr: 'Penduduk Tetap', foreign: 'Pekerja Asing' },
    chipForeign: 'KWSP hanya {e}% · tiada SIP · SKBBK wajib', chip60: 'Caruman KWSP {e}% · majikan {r}% · tiada SIP',
    chipPr: 'Kadar KWSP sama seperti warganegara', chipRelief: 'Pelepasan keluarga jimat cukai RM{x} setahun', chipEmployer: 'Majikan tambah RM{x} ke KWSP sebulan',
    age: 'umur',
  },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k]));
const rm = (n: number, dp = 2) => 'RM' + n.toLocaleString('en-MY', { minimumFractionDigits: dp, maximumFractionDigits: dp });

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => { const m = matchMedia('(prefers-reduced-motion: reduce)'); setR(m.matches); }, []);
  return r;
}

/** Number that eases from its previous value to the new one. */
function CountUp({ value, reduced }: { value: number; reduced: boolean }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced) { setShown(value); from.current = value; return; }
    const start = performance.now(), a = from.current, d = 650;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / d), e = 1 - Math.pow(1 - p, 3);
      setShown(a + (value - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value, reduced]);
  return <>{rm(shown)}</>;
}

let audioCtx: AudioContext | null = null;
function blip(high = false) {
  try {
    audioCtx ??= new AudioContext();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = audioCtx.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(high ? 880 : 620, t);
    o.frequency.exponentialRampToValueAtTime(high ? 1320 : 930, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(audioCtx.destination);
    o.start(t); o.stop(t + 0.18);
  } catch { /* audio unavailable */ }
}

export function Personas({ rules, personas, locale = 'en' }: { rules: MyRules; personas: Persona[]; locale?: Locale }) {
  const t = T[locale];
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [salaries, setSalaries] = useState(() => personas.map((p) => p.salary));
  const [sound, setSound] = useState(false);
  const [inView, setInView] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const p = personas[idx];
  const salary = salaries[idx];
  const input = { monthlySalary: salary, age: p.age, residency: p.residency, taxResident: p.taxResident ?? true, spouseRelief: !!p.spouseRelief, children: p.children ?? 0 };
  const r = useMemo(() => calculateTakeHome(input, rules), [salary, idx, rules]); // eslint-disable-line react-hooks/exhaustive-deps

  const perkeso = r.employee.socso + r.employee.eis + r.employee.skbbk;
  const segs = [
    { key: 'net', label: t.takeHome, v: r.net, cls: 's1' },
    { key: 'epf', label: t.epf, v: r.employee.epf, cls: 's2' },
    { key: 'pk', label: t.perkeso, v: perkeso, cls: 's3' },
    { key: 'tax', label: t.tax, v: r.employee.tax, cls: 's4' },
  ];
  const keep = salary ? Math.round((r.net / salary) * 100) : 0;

  const chips: string[] = [];
  const epfCat = rules.epf.categories;
  if (p.residency === 'foreign') chips.push(fill(t.chipForeign, { e: epfCat.foreign_worker.employee }));
  else if (p.age >= 60) chips.push(fill(t.chip60, { e: p.residency === 'pr' ? epfCat.pr_60_plus.employee : epfCat.citizen_60_plus.employee, r: (p.residency === 'pr' ? epfCat.pr_60_plus : epfCat.citizen_60_plus).employer.at(-1)!.rate }));
  else if (p.residency === 'pr') chips.push(t.chipPr);
  if (p.spouseRelief || p.children) {
    const without = calculateTakeHome({ ...input, spouseRelief: false, children: 0 }, rules);
    const saved = Math.round(without.tax.annualTax - r.tax.annualTax);
    if (saved > 0) chips.push(fill(t.chipRelief, { x: saved.toLocaleString('en-MY') }));
  }
  if (r.employer.epf > 0) chips.push(fill(t.chipEmployer, { x: r.employer.epf.toLocaleString('en-MY') }));

  const pick = (i: number) => {
    setIdx(i);
    if (sound) blip(true);
    track('persona_select', { persona: personas[i].id, locale });
  };
  const setSalary = (v: number) => setSalaries((s) => s.map((x, i) => (i === idx ? v : x)));

  return (
    <section className="personas" ref={box} aria-labelledby="personas-title">
      <div className="personas-head">
        <div>
          <h2 id="personas-title">{t.title}</h2>
          <p className="muted">{t.sub}</p>
        </div>
        <button type="button" className="icon-btn" aria-pressed={sound} onClick={() => { setSound(!sound); if (!sound) blip(true); }}
          title={sound ? t.soundOff : t.soundOn} aria-label={sound ? t.soundOff : t.soundOn}>
          {sound ? '🔊' : '🔈'}
        </button>
      </div>

      <div className="persona-picker" role="tablist">
        {personas.map((q, i) => (
          <button key={q.id} type="button" role="tab" aria-selected={i === idx} className="persona-chip" onClick={() => pick(i)}>
            <Avatar a={q.avatar} size={44} />
            <span><strong>{q.name}</strong><small>{t.status[q.residency]}</small></span>
          </button>
        ))}
      </div>

      <div className="persona-card" role="tabpanel" key={p.id}>
        <div className="persona-id">
          <Avatar a={p.avatar} size={84} />
          <div>
            <div className="persona-name">{p.name} <span className="muted">· {t.age} {p.age}</span></div>
            <div className="persona-tag">{p.tagline[locale]}</div>
            <div className="persona-status">{t.status[p.residency]}</div>
          </div>
          <div className="persona-net">
            <div className="persona-net-value"><CountUp value={inView ? r.net : 0} reduced={reduced} /></div>
            <div className="muted small">{t.takeHome}{t.perMonth}</div>
          </div>
        </div>

        <div className="stack" role="img" aria-label={segs.map((s) => `${s.label} ${rm(s.v)}`).join(', ')}>
          {segs.map((s) => (
            <div key={s.key} className={`seg ${s.cls}`} style={{ width: inView && salary ? `${(s.v / salary) * 100}%` : '0%' }} />
          ))}
        </div>
        <ul className="stack-legend">
          {segs.map((s) => (
            <li key={s.key}><i className={`sw ${s.cls}`} />{s.label} <b>{rm(s.v)}</b></li>
          ))}
        </ul>

        <label className="slider">
          <span>{t.salary}: <b>{rm(salary, 0)}</b></span>
          <input type="range" min={1700} max={15000} step={100} value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            onPointerUp={() => sound && blip()} onKeyUp={() => sound && blip()} />
        </label>

        <p className="keep">{fill(t.keep, { name: p.name })} <b className="keep-n">RM{keep}</b></p>
        <ul className="chips">{chips.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
    </section>
  );
}
