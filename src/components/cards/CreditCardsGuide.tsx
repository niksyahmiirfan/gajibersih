import { cardEligibility, cardPayoff } from '@/engine/finance';
import type { CardData } from '@/lib/cards';
import type { Loc } from '@/lib/routes';
import { Faq, faqJsonLd, rm, Steps, Story, Watch } from '../guide/Guide';
import { CardFinder } from './CardFinder';
import { PayoffRace } from './PayoffRace';
import { AdSlot } from '../AdSlot';

const HAFIZ = { skin: '#c48a62', style: 'short' as const, accent: '#2a78d6' };

function content(loc: Loc) {
  const salary = 2800, price = 3000, fixed = 300;
  const e = cardEligibility(salary);
  const min = cardPayoff(price, 18, { kind: 'minimum' });
  const fix = cardPayoff(price, 18, { kind: 'fixed', amount: fixed });
  const n = { salary: rm(salary), annual: rm(salary * 12), limit: rm(e.maxLimitPerIssuer ?? 0), price: rm(price),
    minM: min.months, minI: rm(min.totalInterest), fixed: rm(fixed), fixM: fix.months, fixI: rm(fix.totalInterest) };

  if (loc === 'ms') return {
    title: 'Panduan kad kredit untuk pemula',
    lead: 'Kad kredit ialah pinjaman jangka pendek. Guna dengan betul, ia mudah dan selamat. Bayar lambat, ia antara hutang paling mahal.',
    howTitle: 'Cara ia berfungsi',
    steps: [
      { title: '💳 Leret', text: 'Bank bayar dahulu bagi pihak anda, sehingga had kredit anda.' },
      { title: '🧾 Penyata', text: 'Sebulan sekali anda terima penyata dengan jumlah perlu dibayar dan tarikh akhir.' },
      { title: '✅ Bayar penuh', text: 'Bayar semua sebelum tarikh akhir: tiada faedah langsung.' },
      { title: '⏳ Bayar sebahagian', text: 'Baki dikenakan faedah 15–18% setahun, dikira setiap hari.' },
    ],
    storyTitle: 'Kisah Hafiz',
    storySub: `24 tahun, gaji ${n.salary} sebulan (${n.annual} setahun)`,
    beats: [
      { emoji: '📝', text: `Pendapatannya bawah RM36,000 setahun, jadi Bank Negara hadkan kad daripada 2 bank sahaja, dengan had sehingga ${n.limit} setiap satu.` },
      { emoji: '💻', text: `Dia beli komputer riba ${n.price} dengan kad baharunya.` },
      { emoji: '🐢', text: `Jika dia bayar minimum sahaja pada 18%, perlu ${n.minM} bulan dan ${n.minI} faedah untuk habis.` },
      { emoji: '🐇', text: `Bayar ${n.fixed} sebulan, habis dalam ${n.fixM} bulan dengan faedah hanya ${n.fixI}.` },
      { emoji: '🏆', text: 'Lebih baik: simpan dahulu, atau guna pelan ansuran 0% dan bayar penuh setiap bulan.' },
    ],
    raceTitle: 'Cuba sendiri',
    finderTitle: 'Pencari kad',
    costsTitle: 'Caj yang perlu diketahui',
    costs: [
      { emoji: '📈', title: 'Faedah 15–18% setahun', text: ' Kadar ikut rekod bayaran 12 bulan: 15% jika sentiasa tepat masa, 17% jika 10–11 kali, 18% jika kurang.' },
      { emoji: '⏰', title: 'Caj lewat bayar', text: ' 1% daripada baki tertunggak, minimum RM10, maksimum RM100.' },
      { emoji: '🏧', title: 'Pendahuluan tunai', text: ' Ada fi (biasanya sekitar 5%) dan faedah 18% bermula hari pertama. Elakkan.' },
      { emoji: '🧾', title: 'Cukai perkhidmatan RM25', text: ' Setiap kad utama dan tambahan, setiap tahun, walaupun yuran tahunan dikecualikan.' },
      { emoji: '🌏', title: 'Belanja luar negara', text: ' Biasanya ada caj tukaran mata wang sekitar 1%. Semak dengan bank.' },
      { emoji: '🎁', title: 'Yuran tahunan', text: ' Banyak kad permulaan tiada yuran atau dikecualikan dengan belanja minimum.' },
    ],
    rulesTitle: 'Peraturan emas',
    rules: [
      { title: 'Auto-debit bayaran penuh', text: 'Tetapkan arahan tetap supaya anda tak pernah terlepas tarikh akhir.' },
      { title: 'Belanja guna duit sedia ada', text: 'Jika tiada dalam akaun, jangan leret.' },
      { title: 'Guna bawah 30% had', text: 'Penggunaan rendah nampak baik dalam rekod kredit anda.' },
      { title: 'Satu kad dahulu', text: 'Kuasai satu kad sebelum menambah kad kedua.' },
    ],
    faqTitle: 'Soalan lazim',
    faqs: [
      { q: 'Bolehkah saya mohon dengan gaji RM2,000?', a: 'Ya. Minimum Bank Negara ialah RM24,000 setahun (RM2,000 sebulan) dan umur 21 tahun. Jika pendapatan anda RM36,000 setahun atau kurang, anda boleh pegang kad daripada 2 bank sahaja dengan had sehingga 2 kali gaji bulanan setiap bank.' },
      { q: 'Apakah tempoh tanpa faedah?', a: 'Jika anda bayar penuh setiap bulan, pembelian baharu tidak dikenakan faedah sehingga tarikh akhir (biasanya sekitar 20 hari selepas tarikh penyata). Jika ada baki tertunggak, faedah dikira dari tarikh transaksi.' },
      { q: 'Adakah kad kredit membantu rekod CCRIS saya?', a: 'Ya, jika anda bayar tepat masa. Rekod bayaran yang baik membantu permohonan pinjaman kereta atau rumah kelak. Bayaran lewat juga direkodkan.' },
      { q: 'Apa beza kad kredit-i (Islamik)?', a: 'Kad-i mengenakan keuntungan atau caj berdasarkan kontrak Syariah, bukan faedah. Peraturan kelayakan Bank Negara yang sama terpakai.' },
      { q: 'Patutkah saya guna pelan ansuran 0%?', a: 'Boleh membantu jika anda pasti dapat bayar setiap ansuran. Semak caj pemprosesan, dan ingat ansuran itu mengurangkan had kredit yang tersedia.' },
      { q: 'Bagaimana jika saya tak mampu bayar?', a: 'Hubungi bank segera untuk berbincang. Anda juga boleh dapatkan kaunseling hutang percuma daripada AKPK (Agensi Kaunseling dan Pengurusan Kredit), yang ditubuhkan oleh Bank Negara.' },
    ],
    note: 'Belanjawan 2027 mencadangkan kad kredit asas dengan faedah dihadkan pada 14%. Kami akan kemas kini apabila ia diperkenalkan.',
    disclaimer: 'Maklumat umum, bukan nasihat kewangan. Kadar dan caj berdasarkan garis panduan Bank Negara Malaysia dan jadual caj bank, disemak November 2026.',
  };

  return {
    title: 'Credit cards, explained simply',
    lead: 'A credit card is a short-term loan. Used well, it is convenient and safe. Paid late, it is one of the most expensive debts you can have.',
    howTitle: 'How it works',
    steps: [
      { title: '💳 Swipe', text: 'The bank pays the shop for you, up to your credit limit.' },
      { title: '🧾 Statement', text: 'Once a month you get a bill with the amount due and a due date.' },
      { title: '✅ Pay in full', text: 'Pay everything by the due date: zero interest.' },
      { title: '⏳ Pay part', text: 'The rest is charged 15–18% a year, calculated daily.' },
    ],
    storyTitle: 'Hafiz’s first card',
    storySub: `24, earns ${n.salary} a month (${n.annual} a year)`,
    beats: [
      { emoji: '📝', text: `He earns under RM36,000 a year, so Bank Negara limits him to cards from 2 banks, with a limit of up to ${n.limit} each.` },
      { emoji: '💻', text: `He buys a ${n.price} laptop on his new card.` },
      { emoji: '🐢', text: `Paying only the minimum at 18%, it takes ${n.minM} months and ${n.minI} in interest to clear.` },
      { emoji: '🐇', text: `Paying ${n.fixed} a month, he is done in ${n.fixM} months and pays just ${n.fixI} in interest.` },
      { emoji: '🏆', text: 'Even better: save first, or use a 0% instalment plan and still pay the card in full each month.' },
    ],
    raceTitle: 'Try it yourself',
    finderTitle: 'Card finder',
    costsTitle: 'Costs to know about',
    costs: [
      { emoji: '📈', title: 'Interest of 15–18% a year', text: ' Your rate depends on the last 12 months: 15% if always on time, 17% if 10–11 times, 18% otherwise.' },
      { emoji: '⏰', title: 'Late payment charge', text: ' 1% of the outstanding balance, minimum RM10, maximum RM100.' },
      { emoji: '🏧', title: 'Cash advance', text: ' A fee (often around 5%) plus 18% interest from day one. Avoid it.' },
      { emoji: '🧾', title: 'RM25 service tax', text: ' On every principal and supplementary card, every year, even when the annual fee is waived.' },
      { emoji: '🌏', title: 'Spending abroad', text: ' Usually a currency conversion charge of around 1%. Check with your bank.' },
      { emoji: '🎁', title: 'Annual fee', text: ' Many starter cards have none, or waive it if you spend a minimum.' },
    ],
    rulesTitle: 'Golden rules',
    rules: [
      { title: 'Auto-debit the full amount', text: 'Set a standing instruction so you never miss a due date.' },
      { title: 'Spend money you already have', text: 'If it is not in your account, do not swipe.' },
      { title: 'Use under 30% of the limit', text: 'Low usage looks good on your credit record.' },
      { title: 'One card first', text: 'Master one card before adding a second.' },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      { q: 'Can I apply with a RM2,000 salary?', a: 'Yes. Bank Negara’s minimum is RM24,000 a year (RM2,000 a month) and age 21. If you earn RM36,000 a year or less, you can hold cards from 2 banks only, with a limit of up to twice your monthly income per bank.' },
      { q: 'What is the interest-free period?', a: 'If you pay in full every month, new purchases are interest-free until the due date (usually around 20 days after the statement date). If you carry a balance, interest runs from the transaction date.' },
      { q: 'Will a credit card help my CCRIS record?', a: 'Yes, if you pay on time. A good repayment record helps later car or home loan applications. Late payments are recorded too.' },
      { q: 'What is different about an Islamic card-i?', a: 'A card-i charges profit or fees under a Shariah contract instead of interest. The same Bank Negara eligibility rules apply.' },
      { q: 'Should I use 0% instalment plans?', a: 'They can help if you are sure you can pay every instalment. Check for processing fees, and remember the instalments reduce your available credit limit.' },
      { q: 'What if I cannot pay?', a: 'Call your bank early to discuss options. You can also get free debt counselling from AKPK (Agensi Kaunseling dan Pengurusan Kredit), set up by Bank Negara.' },
    ],
    note: 'Budget 2027 proposes a basic credit card with interest capped at 14%. We will update this guide once it launches.',
    disclaimer: 'General information, not financial advice. Rates and charges are based on Bank Negara Malaysia guidelines and bank fee schedules, checked November 2026.',
  };
}

export function CreditCardsGuide({ locale, data }: { locale: Loc; data: CardData }) {
  const c = content(locale);
  return (
    <div lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(c.faqs)) }} />
      <div className="guide-hero">
        <h1>{c.title}</h1>
        <p className="lead">{c.lead}</p>
      </div>
      <section className="section"><h2>{c.howTitle}</h2><Steps items={c.steps} /></section>
      <section className="section"><h2>{c.storyTitle}</h2>
        <Story avatar={HAFIZ} name="Hafiz" sub={c.storySub} beats={c.beats} />
      </section>
      <section className="section" id="race"><h2>{c.raceTitle}</h2><PayoffRace locale={locale} /></section>
      <AdSlot slot="0000000004" />
      <section className="section" id="finder"><h2>{c.finderTitle}</h2>
        <CardFinder cards={data.cards} lastChecked={data.last_checked} locale={locale} />
      </section>
      <section className="section"><h2>{c.costsTitle}</h2><Watch items={c.costs} /></section>
      <section className="section"><h2>{c.rulesTitle}</h2><Steps items={c.rules} /></section>
      <section className="section"><h2>{c.faqTitle}</h2><Faq items={c.faqs} /></section>
      <p className="callout">🆕 {c.note}</p>
      <p className="small-print">{c.disclaimer} <a href="https://www.bnm.gov.my/">bnm.gov.my</a> · <a href="https://www.akpk.org.my/">akpk.org.my</a></p>
    </div>
  );
}
