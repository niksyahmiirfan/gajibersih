import type { Metadata } from 'next';
import { loadMyRules } from '@/lib/rules';
import { loadContent } from '@/lib/content';
import { Calculator } from '@/components/Calculator';
import { Personas } from '@/components/Personas';
import { loadPersonas } from '@/lib/extras';

export const metadata: Metadata = {
  title: 'Kalkulator gaji bersih Malaysia 2026 (KWSP, PERKESO, SIP, PCB)',
  description: 'Kira gaji bersih anda selepas potongan KWSP, PERKESO, SIP, SKBBK dan anggaran cukai pendapatan berdasarkan kadar rasmi 2026.',
  alternates: { canonical: '/ms/kalkulator-gaji-bersih/', languages: { en: '/take-home-pay-calculator/' } },
};

export default function Page() {
  const rules = loadMyRules();
  const doc = loadContent('ms', 'tools', 'take-home-pay');
  return (
    <div lang="ms">
      <h1>Kalkulator gaji bersih Malaysia {rules.meta.year}</h1>
      <p className="lead">Masukkan gaji kasar bulanan untuk melihat gaji bersih selepas potongan KWSP, PERKESO, SIP, SKBBK dan anggaran cukai, serta kos yang ditanggung majikan.</p>
      <Calculator rules={rules} locale="ms" />
      <Personas rules={rules} personas={loadPersonas()} locale="ms" />
      {doc && <article className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />}
    </div>
  );
}
