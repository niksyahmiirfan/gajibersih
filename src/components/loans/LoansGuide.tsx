import { homeUpfrontCosts, loanSummary, loanStampDuty, motStampDuty } from '@/engine/finance';
import { calculateTakeHome } from '@/engine/my/takeHome';
import type { MyRules } from '@/engine/my/types';
import type { Loc } from '@/lib/routes';
import { Faq, faqJsonLd, rm, Story, Watch } from '../guide/Guide';
import { CarLoanCalc, HomeLoanCalc } from './LoanCalcs';
import { LoanTabs } from './LoanTabs';
import { AdSlot } from '../AdSlot';

const NURUL = { skin: '#d9a07a', style: 'tudung' as const, accent: '#6250d6' };
const DANIEL = { skin: '#e2b08c', style: 'short' as const, accent: '#1baf7a' };

function numbers(rules: MyRules) {
  // Car story — Nurul
  const carNet = calculateTakeHome({ monthlySalary: 4000 }, rules).net;
  const car10 = loanSummary(54_000, 5.5, 84);
  const car20 = loanSummary(48_000, 5.5, 84);
  const car9y = loanSummary(54_000, 5.5, 108);
  // Home story — Daniel & Sofia
  const homeNet = calculateTakeHome({ monthlySalary: 5000 }, rules).net + calculateTakeHome({ monthlySalary: 4500 }, rules).net;
  const costs = homeUpfrontCosts(450_000, 10, true);
  const h35 = loanSummary(costs.loan, 4, 420);
  const h30 = loanSummary(costs.loan, 4, 360);
  const h35up = loanSummary(costs.loan, 5, 420);
  const dutySaved = motStampDuty(450_000) + loanStampDuty(costs.loan);
  return {
    carNet: rm(carNet), c10: rm(car10.monthly), c10pct: Math.round((car10.monthly / carNet) * 100), c10i: rm(car10.totalInterest),
    c20: rm(car20.monthly), c20pct: Math.round((car20.monthly / carNet) * 100), c9: rm(car9y.monthly), c9extra: rm(car9y.totalInterest - car10.totalInterest),
    homeNet: rm(homeNet), down: rm(costs.downPayment), loan: rm(costs.loan), dutySaved: rm(dutySaved),
    h35: rm(h35.monthly), h35pct: Math.round((h35.monthly / homeNet) * 100), h35i: rm(h35.totalInterest),
    h30: rm(h30.monthly), h30save: rm(h35.totalInterest - h30.totalInterest), h35up: rm(h35up.monthly), h35upd: rm(h35up.monthly - h35.monthly),
  };
}

function content(loc: Loc, n: ReturnType<typeof numbers>) {
  if (loc === 'ms') return {
    title: 'Pinjaman pertama anda: kereta dan rumah',
    lead: 'Dua komitmen terbesar ramai orang muda. Fahami cara ia dikira sebelum menandatangani apa-apa.',
    tabs: ['Kereta', 'Rumah'] as [string, string],
    car: {
      what: 'Pinjaman kereta (sewa beli) secara ringkas',
      whatText: 'Bank membeli kereta, anda membayar balik secara ansuran. Sejak 1 Jun 2026, pinjaman sewa beli baharu menggunakan kaedah baki berkurangan dan mesti menunjukkan Kadar Faedah Efektif (EIR). Faedah hanya dikira atas baki yang masih dihutang, jadi bayar awal kini menjimatkan faedah.',
      storyTitle: 'Kisah Nurul', storySub: `26 tahun, gaji RM4,000 (bersih ${n.carNet})`,
      beats: [
        { emoji: '🚗', text: 'Dia jatuh cinta dengan kereta kompak RM60,000 dan bayar 10% pendahuluan.' },
        { emoji: '🧮', text: `Pada EIR 5.5% selama 7 tahun, ansuran ${n.c10} sebulan, iaitu ${n.c10pct}% gaji bersihnya. Jumlah faedah ${n.c10i}.` },
        { emoji: '🤔', text: `Jurujual cadangkan 9 tahun untuk ansuran ${n.c9}. Nampak murah, tetapi faedah bertambah ${n.c9extra}.` },
        { emoji: '💪', text: `Dia menyimpan 6 bulan lagi dan bayar 20% pendahuluan. Ansuran turun ke ${n.c20} (${n.c20pct}% gaji bersih).` },
      ],
      calcTitle: 'Kalkulator pinjaman kereta',
      watchTitle: 'Perkara yang perlu diwaspadai',
      watch: [
        { emoji: '🔍', title: 'Bandingkan EIR, bukan kadar rata', text: ' Kadar rata 3% bukan sama dengan EIR 3%. Dalam contoh Bank Negara, 3% rata selama 9 tahun bersamaan kira-kira 5.5% EIR.' },
        { emoji: '📆', title: 'Tempoh panjang = faedah lebih', text: ' Ansuran lebih rendah selalunya bermakna jumlah bayaran lebih tinggi. Tempoh maksimum ialah 9 tahun.' },
        { emoji: '🧾', title: 'Tambahan yang diselitkan', text: ' Insurans, waranti lanjutan atau aksesori kadang-kadang dimasukkan dalam pinjaman. Minta harga berasingan.' },
        { emoji: '📉', title: 'Kereta susut nilai', text: ' Kereta baharu boleh hilang nilai dengan cepat. Jangan pinjam lebih daripada yang perlu.' },
        { emoji: '⚠️', title: 'Bayaran lewat', text: ' Direkodkan dalam CCRIS dan boleh membawa kepada penarikan balik kereta selepas notis.' },
        { emoji: '🤝', title: 'Menjadi penjamin', text: ' Jika peminjam gagal bayar, penjamin perlu bayar. Fikir dua kali.' },
      ],
      faqs: [
        { q: 'Apa beza kadar rata dan EIR?', a: 'Kadar rata mengira faedah atas jumlah pinjaman asal sepanjang tempoh. EIR mengira atas baki yang berkurangan, jadi nombornya lebih tinggi untuk kos yang sama. Sejak 1 Jun 2026, pinjaman sewa beli baharu mesti menunjukkan EIR.' },
        { q: 'Berapa banyak pendahuluan yang perlu?', a: 'Bank biasanya membiayai sehingga 90% harga kereta, jadi sekurang-kurangnya 10%. Lebih banyak pendahuluan bermakna ansuran dan faedah lebih rendah.' },
        { q: 'Bolehkah saya selesaikan pinjaman awal?', a: 'Ya. Dengan kaedah baki berkurangan, menyelesaikan awal menjimatkan faedah yang belum dikira. Semak terma penyelesaian awal dalam perjanjian anda.' },
        { q: 'Berapa lama tempoh maksimum?', a: '9 tahun untuk kereta di bawah garis panduan Bank Negara.' },
        { q: 'Kereta terpakai lebih murah dari segi pinjaman?', a: 'Harga lebih rendah, tetapi kadar faedah dan tempoh untuk kereta terpakai berbeza mengikut bank dan umur kereta. Bandingkan EIR dan jumlah kos.' },
      ],
    },
    home: {
      what: 'Pinjaman rumah secara ringkas',
      whatText: 'Bank membiayai sebahagian besar harga rumah dan anda membayar balik sehingga 35 tahun. Kebanyakan pinjaman rumah adalah kadar boleh ubah yang dikaitkan dengan Kadar Asas Standard (SBR) bank, yang bergerak mengikut OPR Bank Negara (2.75% pada November 2026).',
      storyTitle: 'Kisah Daniel & Sofia', storySub: `Gaji RM5,000 + RM4,500 (bersih bersama ${n.homeNet})`,
      beats: [
        { emoji: '🏠', text: `Mereka menemui kondominium RM450,000, rumah pertama mereka. Pendahuluan 10% ialah ${n.down}.` },
        { emoji: '🎉', text: `Sebagai pembeli rumah pertama, mereka tidak perlu bayar duti setem, menjimatkan ${n.dutySaved}.` },
        { emoji: '🧮', text: `Pinjaman ${n.loan} pada 4% selama 35 tahun: ${n.h35} sebulan (${n.h35pct}% gaji bersih). Tetapi jumlah faedah ${n.h35i}.` },
        { emoji: '⏱️', text: `Memilih 30 tahun: ${n.h30} sebulan, dan menjimatkan ${n.h30save} faedah.` },
        { emoji: '📈', text: `Mereka juga uji jika kadar naik 1%: ansuran menjadi ${n.h35up} (+${n.h35upd}). Masih mampu, jadi mereka teruskan.` },
      ],
      calcTitle: 'Kalkulator pinjaman rumah',
      watchTitle: 'Perkara yang perlu diwaspadai',
      watch: [
        { emoji: '🔒', title: 'Tempoh kunci (lock-in)', text: ' Menjual atau membiaya semula awal boleh dikenakan penalti. Semak tempoh dan kadarnya.' },
        { emoji: '📈', title: 'Kadar boleh berubah', text: ' Jika OPR naik, ansuran boleh naik. Pastikan anda masih mampu jika kadar naik 1%.' },
        { emoji: '🛡️', title: 'MRTA atau MLTA', text: ' Insurans pinjaman melindungi keluarga jika berlaku sesuatu. Bandingkan kos dan perlindungan sebelum menerima pakej bank.' },
        { emoji: '💸', title: 'Kos tersembunyi', text: ' Yuran guaman, penilaian, berpindah, pengubahsuaian, serta yuran penyelenggaraan dan dana penjelas untuk strata.' },
        { emoji: '🧾', title: 'Semua hutang dikira', text: ' Bank melihat nisbah khidmat hutang (DSR): semua ansuran bulanan berbanding pendapatan. Hutang kereta dan kad mengurangkan jumlah yang boleh dipinjam.' },
        { emoji: '🏗️', title: 'Rumah dalam pembinaan', text: ' Anda mungkin membayar faedah semasa pembinaan apabila bank mengeluarkan wang secara berperingkat.' },
      ],
      faqs: [
        { q: 'Berapa banyak yang boleh saya pinjam?', a: 'Bank menilai DSR anda, iaitu semua bayaran hutang bulanan berbanding pendapatan bersih. Had berbeza mengikut bank. Bagi keselesaan, sasarkan pinjaman rumah bawah 30% gaji bersih.' },
        { q: 'Berapa lama tempoh maksimum?', a: 'Sehingga 35 tahun atau sehingga umur 70 tahun, yang mana lebih awal.' },
        { q: 'Berapa pendahuluan diperlukan?', a: 'Untuk dua rumah pertama, bank boleh membiayai sehingga 90%, jadi sekurang-kurangnya 10% pendahuluan.' },
        { q: 'Adakah saya layak pengecualian duti setem?', a: 'Warganegara yang belum pernah memiliki rumah mendapat pengecualian penuh duti setem pindah milik dan perjanjian pinjaman untuk rumah sehingga RM500,000, bagi SPA yang ditandatangani sehingga 31 Disember 2027.' },
        { q: 'Bolehkah saya guna KWSP?', a: 'Ya, daripada Akaun Sejahtera untuk membantu pendahuluan atau bayaran pinjaman, tertakluk kepada syarat KWSP.' },
        { q: 'Pinjaman flexi atau term?', a: 'Pinjaman flexi membolehkan anda masukkan wang lebih dan mengeluarkannya semula, mengurangkan faedah. Ia sesuai jika anda berdisiplin dan selalu ada wang lebihan; kadang-kadang kadarnya sedikit lebih tinggi.' },
      ],
    },
    faqTitle: 'Soalan lazim',
    disclaimer: 'Maklumat umum, bukan nasihat kewangan. Kadar faedah ialah contoh; dapatkan sebut harga dan EIR daripada bank. Peraturan berdasarkan Akta Sewa Beli (Pindaan) 2026, garis panduan Bank Negara dan Belanjawan 2026, disemak November 2026.',
  };

  return {
    title: 'Your first loan: car and home',
    lead: 'The two biggest commitments most young professionals make. Understand how they are worked out before you sign anything.',
    tabs: ['Car', 'Home'] as [string, string],
    car: {
      what: 'Car loans (hire purchase) in plain words',
      whatText: 'The bank buys the car and you pay it back in instalments. Since 1 June 2026, new hire-purchase loans use the reducing-balance method and must show an Effective Interest Rate (EIR). Interest is only charged on what you still owe, so paying early now saves interest.',
      storyTitle: 'Nurul’s first car', storySub: `26, earns RM4,000 (take-home ${n.carNet})`,
      beats: [
        { emoji: '🚗', text: 'She falls for a RM60,000 compact car and puts 10% down.' },
        { emoji: '🧮', text: `At 5.5% EIR over 7 years, that is ${n.c10} a month, ${n.c10pct}% of her take-home. Total interest: ${n.c10i}.` },
        { emoji: '🤔', text: `The salesperson suggests 9 years for ${n.c9} a month. It looks cheaper, but adds ${n.c9extra} in interest.` },
        { emoji: '💪', text: `She saves for 6 more months and puts 20% down. The instalment drops to ${n.c20} (${n.c20pct}% of take-home).` },
      ],
      calcTitle: 'Car loan calculator',
      watchTitle: 'Things to watch out for',
      watch: [
        { emoji: '🔍', title: 'Compare EIR, not flat rates', text: ' A 3% flat rate is not a 3% EIR. In Bank Negara’s example, 3% flat over 9 years works out to about 5.5% EIR.' },
        { emoji: '📆', title: 'Longer loan = more interest', text: ' A lower instalment usually means paying more in total. The maximum is 9 years.' },
        { emoji: '🧾', title: 'Bundled extras', text: ' Insurance, extended warranties or accessories are sometimes rolled into the loan. Ask for separate prices.' },
        { emoji: '📉', title: 'Cars lose value', text: ' New cars can lose value quickly. Do not borrow more than you need.' },
        { emoji: '⚠️', title: 'Late payments', text: ' They go on your CCRIS record and can lead to the car being repossessed after notice.' },
        { emoji: '🤝', title: 'Being a guarantor', text: ' If the borrower stops paying, the guarantor has to pay. Think twice.' },
      ],
      faqs: [
        { q: 'What is the difference between a flat rate and EIR?', a: 'A flat rate charges interest on the original loan amount for the whole period. EIR charges on the shrinking balance, so the number is higher for the same cost. Since 1 June 2026, new hire-purchase loans must show the EIR.' },
        { q: 'How much down payment do I need?', a: 'Banks usually finance up to 90% of the price, so at least 10%. A bigger down payment means a smaller instalment and less interest.' },
        { q: 'Can I settle my car loan early?', a: 'Yes. With the reducing-balance method, settling early saves the interest not yet charged. Check the early settlement terms in your agreement.' },
        { q: 'What is the longest loan period?', a: '9 years for cars, under Bank Negara’s guidelines.' },
        { q: 'Is a used car cheaper to finance?', a: 'The price is lower, but rates and loan periods for used cars vary by bank and the car’s age. Compare the EIR and the total cost.' },
      ],
    },
    home: {
      what: 'Home loans in plain words',
      whatText: 'The bank funds most of the price and you repay over up to 35 years. Most home loans are variable-rate, linked to the bank’s Standardised Base Rate (SBR), which moves with Bank Negara’s OPR (2.75% in November 2026).',
      storyTitle: 'Daniel & Sofia’s first home', storySub: `Earn RM5,000 + RM4,500 (take-home together ${n.homeNet})`,
      beats: [
        { emoji: '🏠', text: `They find a RM450,000 condo, their first home. A 10% down payment is ${n.down}.` },
        { emoji: '🎉', text: `As first-time buyers they pay no stamp duty, saving ${n.dutySaved}.` },
        { emoji: '🧮', text: `A ${n.loan} loan at 4% over 35 years: ${n.h35} a month (${n.h35pct}% of take-home). But total interest is ${n.h35i}.` },
        { emoji: '⏱️', text: `Choosing 30 years instead: ${n.h30} a month, and ${n.h30save} less interest.` },
        { emoji: '📈', text: `They also test a 1% rate rise: the instalment becomes ${n.h35up} (+${n.h35upd}). Still affordable, so they go ahead.` },
      ],
      calcTitle: 'Home loan calculator',
      watchTitle: 'Things to watch out for',
      watch: [
        { emoji: '🔒', title: 'Lock-in period', text: ' Selling or refinancing early can mean a penalty. Check how long and how much.' },
        { emoji: '📈', title: 'Rates can change', text: ' If the OPR rises, your instalment can rise. Make sure you could still pay if rates went up 1%.' },
        { emoji: '🛡️', title: 'MRTA or MLTA', text: ' Loan insurance protects your family if something happens. Compare cost and cover before accepting the bank’s package.' },
        { emoji: '💸', title: 'Hidden costs', text: ' Legal fees, valuation, moving, renovation, plus maintenance fees and sinking fund for strata homes.' },
        { emoji: '🧾', title: 'All debts count', text: ' Banks look at your debt service ratio (DSR): all monthly instalments against income. Car and card debts reduce what you can borrow.' },
        { emoji: '🏗️', title: 'Under-construction homes', text: ' You may pay interest during construction as the bank releases money in stages.' },
      ],
      faqs: [
        { q: 'How much can I borrow?', a: 'Banks assess your DSR: all monthly debt repayments against net income. Limits vary by bank. For comfort, aim to keep the home loan under 30% of take-home pay.' },
        { q: 'What is the longest loan period?', a: 'Up to 35 years or until age 70, whichever comes first.' },
        { q: 'How much down payment do I need?', a: 'For your first two homes, banks can finance up to 90%, so at least 10% down.' },
        { q: 'Do I qualify for the stamp duty exemption?', a: 'Malaysians who have never owned a home get a full exemption on stamp duty for the transfer and the loan agreement, for homes up to RM500,000, on SPAs signed by 31 December 2027.' },
        { q: 'Can I use my EPF?', a: 'Yes, from Akaun Sejahtera to help with the down payment or loan repayments, subject to KWSP’s conditions.' },
        { q: 'Flexi loan or term loan?', a: 'A flexi loan lets you put in extra money and take it out again, cutting interest. It suits people with spare cash and discipline; the rate is sometimes slightly higher.' },
      ],
    },
    faqTitle: 'Frequently asked questions',
    disclaimer: 'General information, not financial advice. Interest rates are examples; get quotes and the EIR from banks. Rules are based on the Hire-Purchase (Amendment) Act 2026, Bank Negara guidelines and Budget 2026, checked November 2026.',
  };
}

export function LoansGuide({ locale, rules }: { locale: Loc; rules: MyRules }) {
  const c = content(locale, numbers(rules));
  const panel = (k: 'car' | 'home') => {
    const p = c[k];
    return (
      <>
        <section className="section"><h2>{p.what}</h2><p className="prose" style={{ margin: 0 }}>{p.whatText}</p></section>
        <section className="section"><h2>{p.storyTitle}</h2>
          <Story avatar={k === 'car' ? NURUL : DANIEL} name={k === 'car' ? 'Nurul' : 'Daniel & Sofia'} sub={p.storySub} beats={p.beats} />
        </section>
        <section className="section"><h2>{p.calcTitle}</h2>
          {k === 'car' ? <CarLoanCalc rules={rules} locale={locale} /> : <HomeLoanCalc rules={rules} locale={locale} />}
        </section>
        <AdSlot slot={k === 'car' ? '0000000005' : '0000000006'} />
        <section className="section"><h2>{p.watchTitle}</h2><Watch items={p.watch} /></section>
        <section className="section"><h2>{c.faqTitle}</h2><Faq items={p.faqs} /></section>
      </>
    );
  };
  return (
    <div lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd([...c.car.faqs, ...c.home.faqs])) }} />
      <div className="guide-hero"><h1>{c.title}</h1><p className="lead">{c.lead}</p></div>
      <LoanTabs labels={c.tabs} car={panel('car')} home={panel('home')} />
      <p className="small-print">{c.disclaimer} <a href="https://www.bnm.gov.my/">bnm.gov.my</a> · <a href="https://www.kwsp.gov.my/">kwsp.gov.my</a></p>
    </div>
  );
}
