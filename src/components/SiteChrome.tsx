'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { counterpart, localeOf, NAV } from '@/lib/routes';
import { ThemeToggle } from './ThemeToggle';

function Icon({ name }: { name: 'calc' | 'card' | 'loan' | 'read' }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'calc': return <svg {...p}><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></svg>;
    case 'card': return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M3 10h18M7 15h3" /></svg>;
    case 'loan': return <svg {...p}><path d="M4 11.5 12 5l8 6.5" /><path d="M6.5 10v9h11v-9" /><path d="M10.5 19v-4.5h3V19" /></svg>;
    case 'read': return <svg {...p}><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" /><path d="M12 6v13" /></svg>;
  }
}

const isActive = (path: string, href: string) => (href === '/' ? path === '/' || path.startsWith('/take-home') || path.startsWith('/salary') : path.startsWith(href));

export function Header({ siteName }: { siteName: string }) {
  const path = usePathname() || '/';
  const loc = localeOf(path);
  const other = counterpart(path);
  return (
    <>
      <header className="site-header">
        <Link href={loc === 'ms' ? '/ms/kalkulator-gaji-bersih/' : '/'} className="brand">{siteName}</Link>
        <nav className="top-nav" aria-label={loc === 'ms' ? 'Navigasi utama' : 'Main'}>
          {NAV.map((n) => (
            <Link key={n.key} href={n.href[loc]} aria-current={isActive(path, n.href[loc]) ? 'page' : undefined}>{n[loc]}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <div className="lang-toggle" role="group" aria-label="Language / Bahasa">
            {loc === 'en'
              ? <><span aria-current="true">EN</span><Link href={other} hrefLang="ms" lang="ms">BM</Link></>
              : <><Link href={other} hrefLang="en" lang="en">EN</Link><span aria-current="true">BM</span></>}
          </div>
          <ThemeToggle />
        </div>
      </header>
      <nav className="tabbar" aria-label={loc === 'ms' ? 'Navigasi' : 'Navigation'}>
        {NAV.map((n) => (
          <Link key={n.key} href={n.href[loc]} aria-current={isActive(path, n.href[loc]) ? 'page' : undefined}>
            <Icon name={n.icon} /><span>{n[loc]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export function Footer() {
  const loc = localeOf(usePathname() || '/');
  return loc === 'ms' ? (
    <footer className="site-footer" lang="ms">
      <p>Angka berdasarkan sumber rasmi KWSP, PERKESO, LHDN dan Bank Negara Malaysia. Anggaran sahaja, bukan nasihat kewangan atau cukai.</p>
      <p><Link href="/about/">Tentang</Link> · <Link href="/methodology/">Metodologi</Link> · <Link href="/privacy/">Privasi</Link></p>
    </footer>
  ) : (
    <footer className="site-footer">
      <p>Figures come from official KWSP, PERKESO, LHDN and Bank Negara Malaysia sources. Estimates only, not financial or tax advice.</p>
      <p><Link href="/about/">About</Link> · <Link href="/methodology/">Methodology &amp; sources</Link> · <Link href="/sharings/">Sharings</Link> · <Link href="/privacy/">Privacy</Link></p>
    </footer>
  );
}
