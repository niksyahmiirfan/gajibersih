import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy policy', alternates: { canonical: '/privacy/' } };

export default function Privacy() {
  return (
    <article className="prose">
      <h1>Privacy policy</h1>
      <p>{SITE.name} runs every calculation in your browser. The salary and details you type are not sent to our servers.</p>
      <h2>Analytics</h2>
      <p>We use Google Analytics to count visits and calculator use (salary is recorded only as a RM1,000 band). Google may set cookies for this.</p>
      <h2>Advertising</h2>
      <p>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visits.
        You can opt out of personalised advertising at <a href="https://adssettings.google.com">Google Ads Settings</a>.</p>
      <h2>Affiliate links</h2>
      <p>Some links may be affiliate links. We may earn a commission at no extra cost to you, and we label these links.</p>
      <h2>Contact</h2>
      <p>Questions about this policy: open an issue on our GitHub repository.</p>
    </article>
  );
}
