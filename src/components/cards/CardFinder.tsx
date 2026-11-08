'use client';
import { useMemo, useState } from 'react';
import type { CardTag, CreditCard } from '@/lib/cards';
import type { Loc } from '@/lib/routes';
import { matchCards } from '@/engine/cardMatch';
import { cardEligibility } from '@/engine/finance';
import { track } from '../analytics';

const T = {
  en: {
    title: 'Find a card that fits you', income: 'Monthly gross salary', spend: 'Where do you spend the most? (pick up to 3)',
    noFee: 'No annual fee', islamic: 'Islamic (card-i) only', habit: 'How will you pay your bill?', full: 'In full every month', part: 'Sometimes only part',
    tags: { petrol: '⛽ Petrol', groceries: '🛒 Groceries', online: '🛍️ Online', dining: '🍜 Dining', ehailing: '🚗 Grab / e-hailing', travel: '✈️ Travel', bills: '💡 Bills', everyday: 'Everyday' } as Record<CardTag, string>,
    reasons: { nofee: 'No annual fee', waivable: 'Fee waivable', islamic: 'Shariah-compliant' } as Record<string, string>,
    fee: { none: 'No annual fee', waivable: 'Annual fee waivable', check: 'Check annual fee' },
    minInc: 'Min. income', perYear: '/yr', visit: 'See on bank site',
    notEligible: 'Bank Negara rules need at least RM2,000 a month (RM24,000 a year) for a credit card. A debit card and a small emergency fund are great first steps.',
    capped: 'At your income, Bank Negara limits you to cards from 2 banks, with a credit limit of up to {x} each.',
    partWarn: 'Carrying a balance? Rewards rarely beat 15–18% interest. We have ranked simple, no-fee cards higher. The best move is to pay in full.',
    none: 'No cards match all your choices. Try removing a filter.',
    disclaimer: 'Starter list of entry-level cards, checked {d}. Perks, caps and fees change often: always confirm on the bank\'s website. Not financial advice; we are not paid for these listings.',
  },
  ms: {
    title: 'Cari kad yang sesuai', income: 'Gaji kasar bulanan', spend: 'Di mana anda paling banyak berbelanja? (pilih sehingga 3)',
    noFee: 'Tiada yuran tahunan', islamic: 'Islamik (kad-i) sahaja', habit: 'Bagaimana anda akan bayar bil?', full: 'Penuh setiap bulan', part: 'Kadang-kadang sebahagian',
    tags: { petrol: '⛽ Petrol', groceries: '🛒 Barang dapur', online: '🛍️ Dalam talian', dining: '🍜 Makan', ehailing: '🚗 Grab / e-hailing', travel: '✈️ Melancong', bills: '💡 Bil', everyday: 'Harian' } as Record<CardTag, string>,
    reasons: { nofee: 'Tiada yuran tahunan', waivable: 'Yuran boleh dikecualikan', islamic: 'Patuh Syariah' } as Record<string, string>,
    fee: { none: 'Tiada yuran tahunan', waivable: 'Yuran tahunan boleh dikecualikan', check: 'Semak yuran tahunan' },
    minInc: 'Pendapatan min.', perYear: '/thn', visit: 'Lihat di laman bank',
    notEligible: 'Peraturan Bank Negara memerlukan sekurang-kurangnya RM2,000 sebulan (RM24,000 setahun) untuk kad kredit. Kad debit dan dana kecemasan kecil ialah langkah pertama yang baik.',
    capped: 'Pada pendapatan anda, Bank Negara hadkan kad daripada 2 bank sahaja, dengan had kredit sehingga {x} setiap satu.',
    partWarn: 'Selalu ada baki? Ganjaran jarang mengatasi faedah 15–18%. Kami letakkan kad ringkas tanpa yuran di atas. Langkah terbaik ialah bayar penuh.',
    none: 'Tiada kad yang memenuhi semua pilihan. Cuba buang satu penapis.',
    disclaimer: 'Senarai permulaan kad peringkat asas, disemak {d}. Faedah, had dan yuran kerap berubah: sentiasa sahkan di laman web bank. Bukan nasihat kewangan; kami tidak dibayar untuk senarai ini.',
  },
};
const SPEND: CardTag[] = ['petrol', 'groceries', 'online', 'dining', 'ehailing', 'travel', 'bills'];
const rm = (n: number) => 'RM' + Math.round(n).toLocaleString('en-MY');

export function CardFinder({ cards, lastChecked, locale }: { cards: CreditCard[]; lastChecked: string; locale: Loc }) {
  const t = T[locale];
  const [income, setIncome] = useState(3500);
  const [spend, setSpend] = useState<CardTag[]>(['groceries', 'online']);
  const [noFee, setNoFee] = useState(true);
  const [islamic, setIslamic] = useState(false);
  const [paysInFull, setPaysInFull] = useState(true);

  const elig = cardEligibility(income);
  const results = useMemo(() => matchCards(cards, { monthlyIncome: income, spend, noFee, islamic, paysInFull }).slice(0, 3),
    [cards, income, spend, noFee, islamic, paysInFull]);

  const toggleSpend = (tag: CardTag) => {
    setSpend((s) => (s.includes(tag) ? s.filter((x) => x !== tag) : s.length >= 3 ? [...s.slice(1), tag] : [...s, tag]));
    track('card_finder_filter', { tag });
  };

  return (
    <div className="tool" style={{ gridTemplateColumns: '1fr' }}>
      <h3 style={{ margin: 0 }}>{t.title}</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <label className="field">
          <span className="field-row">{t.income}<output>{rm(income)}</output></span>
          <input type="range" min={1500} max={15000} step={100} value={income} onChange={(e) => setIncome(+e.target.value)} />
        </label>
        <div className="field"><span>{t.spend}</span>
          <div className="seg-choice">
            {SPEND.map((s) => <button key={s} type="button" aria-pressed={spend.includes(s)} onClick={() => toggleSpend(s)}>{t.tags[s]}</button>)}
          </div>
        </div>
        <div className="field"><span>{t.habit}</span>
          <div className="seg-choice">
            <button type="button" aria-pressed={paysInFull} onClick={() => setPaysInFull(true)}>✅ {t.full}</button>
            <button type="button" aria-pressed={!paysInFull} onClick={() => setPaysInFull(false)}>⏳ {t.part}</button>
          </div>
        </div>
        <div className="seg-choice">
          <button type="button" aria-pressed={noFee} onClick={() => setNoFee(!noFee)}>{noFee ? '✓ ' : ''}{t.noFee}</button>
          <button type="button" aria-pressed={islamic} onClick={() => setIslamic(!islamic)}>{islamic ? '✓ ' : ''}{t.islamic}</button>
        </div>
      </div>

      {!elig.eligible ? (
        <p className="callout warn">🚫 {t.notEligible}</p>
      ) : (
        <>
          {elig.capped && <p className="callout">ℹ️ {t.capped.replace('{x}', rm(elig.maxLimitPerIssuer!))}</p>}
          {!paysInFull && <p className="callout warn">⚠️ {t.partWarn}</p>}
          {results.length ? (
            <div className="card-results" aria-live="polite">
              {results.map((m, i) => (
                <article className="cc" key={m.card.id + i}>
                  <span className="cc-rank">{i + 1}</span>
                  <div className="cc-face" style={{ background: `linear-gradient(135deg, ${m.card.colors[0]}, ${m.card.colors[1]})` }}>
                    <span className="chip" aria-hidden="true" />
                    <div><div className="cc-name">{m.card.name}</div><div className="cc-issuer">{m.card.issuer}</div></div>
                  </div>
                  <div className="why">{m.reasons.map((r) => <span key={r}>{t.tags[r as CardTag] ?? t.reasons[r] ?? r}</span>)}</div>
                  <ul>{m.card.perks[locale].map((p) => <li key={p}>{p}</li>)}</ul>
                  <div className="small-print">{t.minInc}: {rm(m.card.min_income)}{t.perYear} · {t.fee[m.card.fee]}</div>
                  <a href={m.card.url} target="_blank" rel="noopener nofollow" className="small-print" onClick={() => track('card_outbound', { card: m.card.id })}>{t.visit} ↗</a>
                </article>
              ))}
            </div>
          ) : <p className="muted">{t.none}</p>}
        </>
      )}
      <p className="small-print">{t.disclaimer.replace('{d}', lastChecked)}</p>
    </div>
  );
}
