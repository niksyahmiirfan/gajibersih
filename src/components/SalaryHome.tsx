// The Salary tab. One component for EN (/ and /take-home-pay-calculator/) and BM (/ms/kalkulator-gaji-bersih/)
// so both languages always show the same sections.
import { loadMyRules } from '@/lib/rules';
import { loadContent } from '@/lib/content';
import { loadPersonas } from '@/lib/extras';
import type { Loc } from '@/lib/routes';
import { Calculator } from './Calculator';
import { Personas } from './Personas';
import { GuideTeasers } from './GuideTeasers';

const T = {
  en: {
    h1: (y: number) => `Malaysia take-home pay calculator ${y}`,
    lead: 'Enter your monthly gross salary to see your take-home pay after EPF, SOCSO, EIS, SKBBK and an income tax estimate, plus what your employer pays on top.',
  },
  ms: {
    h1: (y: number) => `Kalkulator gaji bersih Malaysia ${y}`,
    lead: 'Masukkan gaji kasar bulanan untuk melihat gaji bersih selepas potongan KWSP, PERKESO, SIP, SKBBK dan anggaran cukai, serta kos yang ditanggung majikan.',
  },
};

export function SalaryHome({ locale }: { locale: Loc }) {
  const rules = loadMyRules();
  const doc = loadContent(locale, 'tools', 'take-home-pay');
  const t = T[locale];
  return (
    <div lang={locale}>
      <h1>{t.h1(rules.meta.year)}</h1>
      <p className="lead">{t.lead}</p>
      <Calculator rules={rules} locale={locale} />
      <Personas rules={rules} personas={loadPersonas()} locale={locale} />
      <GuideTeasers locale={locale} />
      {doc && <article className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />}
    </div>
  );
}
