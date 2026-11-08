import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { loadFunFacts } from '@/lib/extras';
import { ThemeToggle, themeInitScript } from '@/components/ThemeToggle';
import { FunFact } from '@/components/FunFact';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Malaysia take-home pay calculator 2026`, template: `%s | ${SITE.name}` },
  description: 'Work out your net salary in Malaysia after EPF, SOCSO, EIS, SKBBK and income tax, using official 2026 rates.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const facts = loadFunFacts();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {SITE.adsenseClient ? (
          <script async crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`} />
        ) : null}
      </head>
      <body>
        {SITE.gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${SITE.gaId}');`}
            </Script>
          </>
        ) : null}
        <header className="site-header">
          <Link href="/" className="brand">{SITE.name}</Link>
          <nav>
            <Link href="/take-home-pay-calculator/">Calculator</Link>
            <Link href="/ms/kalkulator-gaji-bersih/" hrefLang="ms">BM</Link>
            <Link href="/sharings/">Sharings</Link>
            <Link href="/methodology/">Methodology</Link>
            <ThemeToggle />
          </nav>
        </header>
        <div className="funfact-wrap"><FunFact facts={facts} /></div>
        <main>{children}</main>
        <footer className="site-footer">
          <p>Figures come from official KWSP, PERKESO and LHDN sources. Estimates only — not financial or tax advice.</p>
          <p><Link href="/about/">About</Link> · <Link href="/methodology/">Methodology &amp; sources</Link> · <Link href="/sharings/">Sharings</Link> · <Link href="/privacy/">Privacy</Link></p>
        </footer>
      </body>
    </html>
  );
}
