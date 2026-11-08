import Link from 'next/link';
import type { Loc } from '@/lib/routes';

const T = {
  en: { title: 'Starting your career?', items: [
    { href: '/credit-cards/', emoji: '💳', h: 'Credit cards, explained', p: 'How interest works, the minimum-payment trap, and a card finder.' },
    { href: '/loans/', emoji: '🚗', h: 'First car loan', p: 'New EIR rules, Nurul’s story and a calculator.' },
    { href: '/loans/#home', emoji: '🏠', h: 'First home loan', p: 'Stamp duty exemption, Daniel & Sofia’s story and a calculator.' },
  ] },
  ms: { title: 'Baru mula bekerja?', items: [
    { href: '/ms/kad-kredit/', emoji: '💳', h: 'Panduan kad kredit', p: 'Cara faedah dikira, perangkap bayaran minimum dan pencari kad.' },
    { href: '/ms/pinjaman/', emoji: '🚗', h: 'Pinjaman kereta pertama', p: 'Peraturan EIR baharu, kisah Nurul dan kalkulator.' },
    { href: '/ms/pinjaman/#home', emoji: '🏠', h: 'Pinjaman rumah pertama', p: 'Pengecualian duti setem, kisah Daniel & Sofia dan kalkulator.' },
  ] },
};

export function GuideTeasers({ locale = 'en' }: { locale?: Loc }) {
  const t = T[locale];
  return (
    <section className="section">
      <h2>{t.title}</h2>
      <ul className="posts">
        {t.items.map((i) => (
          <li key={i.href}><Link href={i.href} className="post-card"><span className="emoji" aria-hidden="true">{i.emoji}</span><h2>{i.h}</h2><p>{i.p}</p></Link></li>
        ))}
      </ul>
    </section>
  );
}
