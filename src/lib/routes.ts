// EN ↔ BM page pairs used by the language toggle, nav and hreflang.
export type Loc = 'en' | 'ms';

export const PAIRS: [en: string, ms: string][] = [
  ['/take-home-pay-calculator/', '/ms/kalkulator-gaji-bersih/'],
  ['/credit-cards/', '/ms/kad-kredit/'],
  ['/loans/', '/ms/pinjaman/'],
  ['/sharings/', '/ms/perkongsian/'],
];

export const localeOf = (path: string): Loc => (path === '/ms' || path.startsWith('/ms/') ? 'ms' : 'en');

const norm = (p: string) => (p.endsWith('/') ? p : p + '/');

/** The equivalent page in the other language (falls back to the calculator). */
export function counterpart(path: string): string {
  const p = norm(path);
  const loc = localeOf(p);
  if (loc === 'en') {
    if (p === '/') return '/ms/kalkulator-gaji-bersih/';
    const sal = /^\/salary\/rm-(\d+)-/.exec(p);
    if (sal) return `/ms/kalkulator-gaji-bersih/?salary=${sal[1]}`;
    const hit = PAIRS.find(([en]) => p.startsWith(en));
    return hit ? hit[1] : '/ms/kalkulator-gaji-bersih/';
  }
  if (p.startsWith('/ms/kalkulator-gaji-bersih/')) return '/';
  const hit = PAIRS.find(([, ms]) => p.startsWith(ms));
  return hit ? hit[0] : '/';
}

export const NAV: { key: string; en: string; ms: string; href: Record<Loc, string>; icon: 'calc' | 'card' | 'loan' | 'read' }[] = [
  { key: 'calc', en: 'Salary', ms: 'Gaji', href: { en: '/', ms: '/ms/kalkulator-gaji-bersih/' }, icon: 'calc' },
  { key: 'cards', en: 'Cards', ms: 'Kad Kredit', href: { en: '/credit-cards/', ms: '/ms/kad-kredit/' }, icon: 'card' },
  { key: 'loans', en: 'Loans', ms: 'Pinjaman', href: { en: '/loans/', ms: '/ms/pinjaman/' }, icon: 'loan' },
  { key: 'read', en: 'Sharings', ms: 'Perkongsian', href: { en: '/sharings/', ms: '/ms/perkongsian/' }, icon: 'read' },
];

export function alternates(enPath: string) {
  const ms = counterpart(enPath);
  return { canonical: enPath, languages: { en: enPath, ms } };
}
