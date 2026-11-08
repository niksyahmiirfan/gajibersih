import type { Metadata } from 'next';
import { SalaryHome } from '@/components/SalaryHome';

// Same content as the home page; kept for existing links, canonical points to /.
export const metadata: Metadata = {
  title: 'Net salary calculator Malaysia 2026 (EPF, SOCSO, EIS, PCB)',
  description: 'Calculate your Malaysian take-home pay after EPF, SOCSO, EIS, SKBBK and income tax with official 2026 rates. Includes employer cost.',
  alternates: { canonical: '/', languages: { en: '/', ms: '/ms/kalkulator-gaji-bersih/' } },
};

export default function Page() {
  return <SalaryHome locale="en" />;
}
