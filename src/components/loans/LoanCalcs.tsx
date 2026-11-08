'use client';
import { useMemo, useState } from 'react';
import { homeUpfrontCosts, loanSummary } from '@/engine/finance';
import { calculateTakeHome } from '@/engine/my/takeHome';
import type { MyRules } from '@/engine/my/types';
import type { Loc } from '@/lib/routes';

const rm = (n: number) => 'RM' + Math.round(n).toLocaleString('en-MY');

const T = {
  en: {
    price: 'Car price', down: 'Down payment', rate: 'Interest rate (EIR, a year)', years: 'Loan period', yrs: 'years',
    salary: 'Your gross salary', partner: 'Partner’s gross salary (optional)', monthly: 'Monthly instalment', interest: 'Total interest',
    total: 'Total you repay', loan: 'Loan amount', share: 'of your take-home pay', takeHome: 'Take-home pay',
    zones: { ok: 'Comfortable', mid: 'Stretching', high: 'Heavy' },
    carRule: 'Rule of thumb: keep car payments under 15% of take-home, and no more than 20%.',
    homeRule: 'Rule of thumb: keep your home loan under 30% of take-home. Banks also count all your other debts.',
    flat: 'Older ads would have called this about {x}% “flat”.',
    running: 'Remember insurance, road tax, petrol, parking and servicing on top.',
    homePrice: 'Home price', firstHome: 'First home (Malaysian, never owned one)', upfront: 'Cash needed upfront', duty: 'Stamp duty (transfer + loan)',
    exempt: 'Exempt: first home up to RM500,000 (SPA by 31 Dec 2027)', rateUp: 'If the rate rises 1%:', perMonth: '/month',
    chart: 'Where each year’s payments go', chartI: 'Interest', chartP: 'Paying down the loan', legal: 'Plus legal fees, valuation and moving costs.',
    example: 'Example rates only. Ask banks for their current EIR.',
  },
  ms: {
    price: 'Harga kereta', down: 'Bayaran pendahuluan', rate: 'Kadar faedah (EIR, setahun)', years: 'Tempoh pinjaman', yrs: 'tahun',
    salary: 'Gaji kasar anda', partner: 'Gaji kasar pasangan (pilihan)', monthly: 'Ansuran bulanan', interest: 'Jumlah faedah',
    total: 'Jumlah dibayar balik', loan: 'Jumlah pinjaman', share: 'daripada gaji bersih anda', takeHome: 'Gaji bersih',
    zones: { ok: 'Selesa', mid: 'Agak berat', high: 'Berat' },
    carRule: 'Panduan mudah: ansuran kereta bawah 15% gaji bersih, dan tidak lebih 20%.',
    homeRule: 'Panduan mudah: pinjaman rumah bawah 30% gaji bersih. Bank juga mengira semua hutang lain anda.',
    flat: 'Iklan lama akan menyebut ini sekitar {x}% “kadar rata”.',
    running: 'Ingat insurans, cukai jalan, petrol, parkir dan servis sebagai kos tambahan.',
    homePrice: 'Harga rumah', firstHome: 'Rumah pertama (warganegara, belum pernah memiliki)', upfront: 'Wang tunai diperlukan awal', duty: 'Duti setem (pindah milik + pinjaman)',
    exempt: 'Dikecualikan: rumah pertama sehingga RM500,000 (SPA sebelum 31 Dis 2027)', rateUp: 'Jika kadar naik 1%:', perMonth: '/bulan',
    chart: 'Ke mana bayaran setiap tahun pergi', chartI: 'Faedah', chartP: 'Mengurangkan pinjaman', legal: 'Tambah yuran guaman, penilaian dan kos berpindah.',
    example: 'Kadar contoh sahaja. Tanya bank untuk EIR semasa.',
  },
};

function Slider({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="field">
      <span className="field-row">{label}<output>{display}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}

function Meter({ pct, ok, mid, t, rule }: { pct: number; ok: number; mid: number; t: (typeof T)['en']; rule: string }) {
  const zone = pct <= ok ? 'ok' : pct <= mid ? 'mid' : 'high';
  const color = zone === 'ok' ? 'var(--s1)' : zone === 'mid' ? '#eda100' : 'var(--s3)';
  const icon = zone === 'ok' ? '🙂' : zone === 'mid' ? '😬' : '😰';
  return (
    <div>
      <div className="field-row"><span className={`zone ${zone}`}>{icon} {t.zones[zone]}</span><b>{pct.toFixed(0)}% {t.share}</b></div>
      <div className="meter" role="img" aria-label={`${pct.toFixed(0)}% ${t.share}`}><div style={{ width: `${Math.min(100, pct * 2)}%`, background: color }} /></div>
      <p className="small-print" style={{ margin: 0 }}>{rule}</p>
    </div>
  );
}

function useTakeHome(rules: MyRules, ...gross: number[]) {
  return useMemo(() => gross.reduce((s, g) => s + (g > 0 ? calculateTakeHome({ monthlySalary: g }, rules).net : 0), 0), [rules, ...gross]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function CarLoanCalc({ rules, locale }: { rules: MyRules; locale: Loc }) {
  const t = T[locale];
  const [price, setPrice] = useState(60000);
  const [downPct, setDownPct] = useState(10);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(7);
  const [salary, setSalary] = useState(4000);
  const loan = price * (1 - downPct / 100);
  const s = loanSummary(loan, rate, years * 12);
  const net = useTakeHome(rules, salary);
  const pct = net ? (s.monthly / net) * 100 : 0;
  return (
    <div className="tool">
      <div style={{ display: 'grid', gap: 14 }}>
        <Slider label={t.price} value={price} display={rm(price)} min={20000} max={250000} step={1000} onChange={setPrice} />
        <Slider label={t.down} value={downPct} display={`${downPct}% · ${rm(price * downPct / 100)}`} min={10} max={50} step={5} onChange={setDownPct} />
        <Slider label={t.rate} value={rate} display={`${rate.toFixed(2)}%`} min={2} max={10} step={0.05} onChange={setRate} />
        <Slider label={t.years} value={years} display={`${years} ${t.yrs}`} min={1} max={9} step={1} onChange={setYears} />
        <Slider label={t.salary} value={salary} display={rm(salary)} min={1700} max={20000} step={100} onChange={setSalary} />
        <p className="small-print" style={{ margin: 0 }}>{t.example}</p>
      </div>
      <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
        <div><div className="muted small">{t.monthly}</div><div className="result-big">{rm(s.monthly)}</div></div>
        <Meter pct={pct} ok={15} mid={20} t={t} rule={t.carRule} />
        <dl className="kv">
          <dt>{t.loan}</dt><dd>{rm(loan)}</dd>
          <dt>{t.interest}</dt><dd>{rm(s.totalInterest)}</dd>
          <dt>{t.total}</dt><dd>{rm(s.totalPaid)}</dd>
          <dt>{t.takeHome}</dt><dd>{rm(net)}</dd>
        </dl>
        <p className="small-print" style={{ margin: 0 }}>📜 {t.flat.replace('{x}', s.flatEquivalentPct.toFixed(2))}</p>
        <p className="callout" style={{ margin: 0 }}>🚗 {t.running}</p>
      </div>
    </div>
  );
}

export function HomeLoanCalc({ rules, locale }: { rules: MyRules; locale: Loc }) {
  const t = T[locale];
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(10);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(35);
  const [first, setFirst] = useState(true);
  const [salary, setSalary] = useState(5000);
  const [partner, setPartner] = useState(4500);
  const costs = homeUpfrontCosts(price, downPct, first);
  const s = loanSummary(costs.loan, rate, years * 12);
  const up = loanSummary(costs.loan, rate + 1, years * 12);
  const net = useTakeHome(rules, salary, partner);
  const pct = net ? (s.monthly / net) * 100 : 0;
  const maxYear = Math.max(...s.yearly.map((y) => y.interest + y.principal), 1);
  return (
    <div className="tool">
      <div style={{ display: 'grid', gap: 14 }}>
        <Slider label={t.homePrice} value={price} display={rm(price)} min={150000} max={1500000} step={10000} onChange={setPrice} />
        <Slider label={t.down} value={downPct} display={`${downPct}% · ${rm(costs.downPayment)}`} min={10} max={40} step={5} onChange={setDownPct} />
        <Slider label={t.rate} value={rate} display={`${rate.toFixed(2)}%`} min={2.5} max={7} step={0.05} onChange={setRate} />
        <Slider label={t.years} value={years} display={`${years} ${t.yrs}`} min={5} max={35} step={1} onChange={setYears} />
        <Slider label={t.salary} value={salary} display={rm(salary)} min={1700} max={30000} step={100} onChange={setSalary} />
        <Slider label={t.partner} value={partner} display={partner ? rm(partner) : '—'} min={0} max={30000} step={100} onChange={setPartner} />
        <label className="check" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '.9rem' }}>
          <input type="checkbox" checked={first} onChange={(e) => setFirst(e.target.checked)} style={{ marginTop: 2 }} /> {t.firstHome}
        </label>
        <p className="small-print" style={{ margin: 0 }}>{t.example}</p>
      </div>
      <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
        <div><div className="muted small">{t.monthly}</div><div className="result-big">{rm(s.monthly)}</div>
          <div className="small-print">{t.rateUp} <b>{rm(up.monthly)}{t.perMonth}</b> (+{rm(up.monthly - s.monthly)})</div></div>
        <Meter pct={pct} ok={30} mid={40} t={t} rule={t.homeRule} />
        <dl className="kv">
          <dt>{t.loan}</dt><dd>{rm(costs.loan)}</dd>
          <dt>{t.interest}</dt><dd>{rm(s.totalInterest)}</dd>
          <dt>{t.total}</dt><dd>{rm(s.totalPaid)}</dd>
          <dt>{t.duty}</dt><dd>{costs.exempt ? 'RM0' : rm(costs.motDuty + costs.loanDuty)}</dd>
          <dt><b>{t.upfront}</b></dt><dd><b>{rm(costs.upfront)}</b></dd>
        </dl>
        {costs.exempt && <p className="callout" style={{ margin: 0 }}>🎉 {t.exempt}</p>}
        <p className="small-print" style={{ margin: 0 }}>{t.legal}</p>
        <div>
          <div className="muted small">{t.chart}</div>
          <div className="chart-bars" role="img" aria-label={t.chart}>
            {s.yearly.map((y) => (
              <div className="yb" key={y.year} title={`${y.year}: ${t.chartI} ${rm(y.interest)} · ${t.chartP} ${rm(y.principal)}`}>
                <i style={{ height: `${(y.principal / maxYear) * 100}%`, background: 'var(--s1)' }} />
                <i style={{ height: `${(y.interest / maxYear) * 100}%`, background: 'var(--s4)' }} />
              </div>
            ))}
          </div>
          <div className="chart-legend"><span><i className="sw s4" />{t.chartI}</span><span><i className="sw s1" />{t.chartP}</span></div>
        </div>
      </div>
    </div>
  );
}
