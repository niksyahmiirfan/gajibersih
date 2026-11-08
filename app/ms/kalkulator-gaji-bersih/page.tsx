import type { Metadata } from 'next';
import { SalaryHome } from '@/components/SalaryHome';

export const metadata: Metadata = {
  title: 'Kalkulator gaji bersih Malaysia 2026 (KWSP, PERKESO, SIP, PCB)',
  description: 'Kira gaji bersih anda selepas potongan KWSP, PERKESO, SIP, SKBBK dan anggaran cukai pendapatan berdasarkan kadar rasmi 2026.',
  alternates: { canonical: '/ms/kalkulator-gaji-bersih/', languages: { en: '/', ms: '/ms/kalkulator-gaji-bersih/' } },
};

export default function Page() {
  return <SalaryHome locale="ms" />;
}
