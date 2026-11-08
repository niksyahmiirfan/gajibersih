import type { Metadata } from 'next';
import Link from 'next/link';
import { loadMyRules } from '@/lib/rules';
import { loadContent } from '@/lib/content';
import { Calculator } from '@/components/Calculator';
import { Personas } from '@/components/Personas';
import { loadPersonas } from '@/lib/extras';
import { AdSlot } from '@/components/AdSlot';
import { SalaryLinks } from '@/components/SalaryLinks';

export const metadata: Metadata = {
  title: 'Net salary calculator Malaysia 2026 (EPF, SOCSO, EIS, PCB)',
  description: 'Calculate your Malaysian take-home pay after EPF, SOCSO, EIS, SKBBK and income tax with official 2026 rates. Includes employer cost.',
  alternates: { canonical: '/take-home-pay-calculator/', languages: { ms: '/ms/kalkulator-gaji-bersih/' } },
};

export default function Page() {
  const rules = loadMyRules();
  const doc = loadContent('en', 'tools', 'take-home-pay');
  const asOf = new Date().toISOString().slice(0, 10);
  return (
    <>
      <h1>Take-home pay calculator Malaysia {rules.meta.year}</h1>
      <p className="lead">Your net salary after every statutory deduction, using the KWSP Third Schedule, PERKESO contribution tables and LHDN tax rates.</p>
      <Calculator rules={rules} />
      <Personas rules={rules} personas={loadPersonas()} />
      <AdSlot slot="0000000001" />
      {doc ? (
        <article className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
      ) : (
        <article className="prose">
          <h2>What gets deducted from your salary</h2>
          <p>Malaysian employees normally see four or five deductions: EPF (KWSP) retirement savings, SOCSO and EIS social
            security contributions to PERKESO, the new SKBBK (LINDUNG 24 Jam) non-work accident scheme, and monthly tax
            deduction (PCB). See the <Link href="/methodology/">methodology</Link> for every rate and source.</p>
        </article>
      )}
      <h2>Common salaries</h2>
      <SalaryLinks rules={rules} asOf={asOf} />
    </>
  );
}
