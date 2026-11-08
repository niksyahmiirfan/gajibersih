import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'About', alternates: { canonical: '/about/' } };

export default function About() {
  return (
    <article className="prose">
      <h1>About {SITE.name}</h1>
      <p>{SITE.name} is an independent set of free payroll and tax calculators for people working in Malaysia. It is not affiliated with KWSP, PERKESO or LHDN.</p>
      <p>Our numbers come from code and versioned data files checked against official sources, never typed by hand into articles. Explanatory text is drafted with AI assistance and reviewed by a person before publishing, and every figure in it is checked automatically against the same data the calculator uses.</p>
    </article>
  );
}
