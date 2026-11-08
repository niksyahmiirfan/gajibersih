import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadMyRules } from '@/lib/rules';
import { loadContent } from '@/lib/content';
import { CLUSTER_SALARIES, salarySlug, slugToSalary, SITE } from '@/lib/site';
import { calculateTakeHome } from '@/engine/my/takeHome';
import { formatRM } from '@/engine/my/money';
import { dict } from '@/i18n/dict';
import { Breakdown } from '@/components/Breakdown';
import { AdSlot } from '@/components/AdSlot';
import { SalaryLinks } from '@/components/SalaryLinks';

export const dynamicParams = false;
export function generateStaticParams() {
  return CLUSTER_SALARIES.map((s) => ({ slug: salarySlug(s) }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const salary = slugToSalary((await params).slug)!;
  const rules = loadMyRules();
  const r = calculateTakeHome({ monthlySalary: salary }, rules);
  return {
    title: `RM${salary.toLocaleString()} salary after EPF and tax in Malaysia (${rules.meta.year})`,
    description: `On RM${salary.toLocaleString()} a month you take home about ${formatRM(r.net)} after EPF, SOCSO, EIS, SKBBK and income tax. Full breakdown with ${rules.meta.year} rates.`,
    alternates: { canonical: `/salary/${salarySlug(salary)}/` },
  };
}

export default async function SalaryPage({ params }: Props) {
  const salary = slugToSalary((await params).slug);
  if (!salary) notFound();
  const rules = loadMyRules();
  const asOf = new Date().toISOString().slice(0, 10);
  const r = calculateTakeHome({ monthlySalary: salary, asOf }, rules);
  const doc = loadContent('en', 'salary', String(salary));
  const t = dict.en;
  const pctKept = Math.round((r.net / salary) * 1000) / 10;

  const faqs = doc?.faqs?.length ? doc.faqs : [
    { q: `How much is EPF on a RM${salary.toLocaleString()} salary?`, a: `You contribute ${formatRM(r.employee.epf)} a month (11%) and your employer adds ${formatRM(r.employer.epf)}.` },
    { q: `How much tax do I pay on RM${salary.toLocaleString()} a month?`, a: `With only the automatic reliefs, the estimate is ${formatRM(r.tax.annualTax)} a year, about ${formatRM(r.employee.tax)} a month.` },
  ];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>RM{salary.toLocaleString()} salary after EPF and tax ({rules.meta.year})</h1>
      <p className="lead">
        On a gross salary of RM{salary.toLocaleString()} a month, a Malaysian employee under 60 takes home about{' '}
        <strong>{formatRM(r.net)}</strong> — {pctKept}% of gross. <Link href={`/take-home-pay-calculator/?salary=${salary}`}>Adjust for your situation</Link>.
      </p>
      <p className="updated">Rates last verified {rules.meta.last_verified}{doc?.updated ? ` · Article updated ${doc.updated}` : ''}</p>
      <div className="calc"><div className="prose">
        <h3>Assumptions</h3>
        <p className="small muted">Malaysian citizen, age 30, tax resident, single with no children, SKBBK enrolled, no other reliefs. {t.disclaimer}</p>
      </div><Breakdown r={r} t={t} /></div>
      <AdSlot slot="0000000002" />
      {doc && <article className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />}
      <h2>Frequently asked questions</h2>
      <div className="prose">{faqs.map((f) => (<div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>))}</div>
      <h2>Other salaries</h2>
      <SalaryLinks rules={rules} exclude={salary} asOf={asOf} />
      <p className="small muted">Sources: <a href={rules.meta.sources.epf_third_schedule}>KWSP</a> · <a href={rules.meta.sources.perkeso}>PERKESO</a> · <a href={rules.meta.sources.lhdn_rates}>LHDN</a> · {SITE.name}</p>
    </>
  );
}
