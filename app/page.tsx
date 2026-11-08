import type { Metadata } from 'next';
import { SalaryHome } from '@/components/SalaryHome';

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { en: '/', ms: '/ms/kalkulator-gaji-bersih/' } },
};

export default function Home() {
  return <SalaryHome locale="en" />;
}
