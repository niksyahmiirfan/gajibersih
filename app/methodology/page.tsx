import type { Metadata } from 'next';
import { loadMyRules } from '@/lib/rules';

export const metadata: Metadata = { title: 'Methodology and sources', alternates: { canonical: '/methodology/' } };

export default function Methodology() {
  const { meta, epf, perkeso, tax } = loadMyRules();
  const u60 = epf.categories.citizen_under_60;
  return (
    <article className="prose">
      <h1>Methodology and sources ({meta.year})</h1>
      <p className="updated">Last verified {meta.last_verified}. Every figure is read from versioned data files in our public repository, and each calculation is unit-tested against rows from the official tables.</p>

      <h2>EPF (KWSP)</h2>
      <p>Employees under 60 contribute {u60.employee}%. Employers contribute {u60.employer[0].rate}% on wages up to RM{u60.employer[0].wage_up_to?.toLocaleString()} and {u60.employer[1].rate}% above that.
        Amounts follow the Third Schedule: RM20 wage bands up to RM5,000, RM100 bands up to RM20,000, a straight percentage above RM20,000, with cents rounded up to the next ringgit. <a href={epf.source}>Source</a>.</p>

      <h2>SOCSO, EIS and SKBBK (PERKESO)</h2>
      <p>Contributions are taken from PERKESO&apos;s banded tables on wages up to RM{perkeso.wage_ceiling.toLocaleString()}. SOCSO First Category: employee {perkeso.socso.first_category.employee}%, employer {perkeso.socso.first_category.employer}%.
        EIS: {perkeso.eis.employee}% each. SKBBK (LINDUNG 24 Jam): employee-only {perkeso.skbbk.employee}% from {perkeso.skbbk.effective_from}. <a href={perkeso.source}>Source</a>.</p>

      <h2>Income tax estimate</h2>
      <p>We annualise your salary, subtract the automatic reliefs (individual RM{tax.reliefs.self.toLocaleString()}, EPF up to RM{tax.reliefs.epf_max.toLocaleString()}, SOCSO and EIS up to RM{tax.reliefs.socso_eis_max}) plus any you enter,
        apply the resident tax schedule and the RM{tax.rebates.self} rebate where chargeable income is RM{tax.rebates.chargeable_income_threshold.toLocaleString()} or less, then divide by 12.
        This is an estimate: your employer&apos;s PCB uses LHDN&apos;s computerised calculation, which treats bonuses and mid-year changes differently. <a href={tax.source}>Source</a>.</p>

      <h2>Corrections</h2>
      <p>Found a figure that does not match your payslip or an official table? Open an issue on our GitHub repository and we will check it against the source.</p>
    </article>
  );
}
