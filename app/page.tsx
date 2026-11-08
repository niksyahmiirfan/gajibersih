import Link from 'next/link';
import { loadMyRules } from '@/lib/rules';
import { Calculator } from '@/components/Calculator';
import { Personas } from '@/components/Personas';
import { loadPersonas } from '@/lib/extras';
import { SalaryLinks } from '@/components/SalaryLinks';

export default function Home() {
  const rules = loadMyRules();
  const asOf = new Date().toISOString().slice(0, 10);
  return (
    <>
      <h1>Malaysia take-home pay calculator {rules.meta.year}</h1>
      <p className="lead">
        Enter your monthly salary to see what lands in your bank account after EPF, SOCSO, EIS, SKBBK and an
        income tax estimate — plus what your employer pays on top. <Link href="/ms/kalkulator-gaji-bersih/">Baca dalam Bahasa Malaysia</Link>.
      </p>
      <Calculator rules={rules} />
      <Personas rules={rules} personas={loadPersonas()} />
      <h2>Take-home pay by salary</h2>
      <SalaryLinks rules={rules} asOf={asOf} />
    </>
  );
}
