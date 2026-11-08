import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SITE } from '@/lib/site';
import { loadFunFacts } from '@/lib/extras';
import { themeInitScript } from '@/lib/theme';
import { FunFact } from '@/components/FunFact';
import { Footer, Header } from '@/components/SiteChrome';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Malaysia take-home pay calculator 2026`, template: `%s | ${SITE.name}` },
  description: 'Work out your net salary in Malaysia after EPF, SOCSO, EIS, SKBBK and income tax, plus simple guides to credit cards and loans.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#fbfaf7' }, { media: '(prefers-color-scheme: dark)', color: '#141412' }],
};

// Sets data-theme (saved choice) and lang (BM pages live under /ms/) before first paint.
const bootScript = themeInitScript + "(function(){var p=location.pathname;if(p==='/ms'||p.indexOf('/ms/')===0)document.documentElement.lang='ms';})();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const facts = loadFunFacts();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
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
        <Header siteName={SITE.name} />
        <div className="funfact-wrap"><FunFact facts={facts} /></div>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
