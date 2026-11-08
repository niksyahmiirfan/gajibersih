import type { Metadata } from 'next';
import { loadMyRules } from '@/lib/rules';
import { LoansGuide } from '@/components/loans/LoansGuide';

export const metadata: Metadata = {
  title: 'Panduan pinjaman kereta & rumah pertama di Malaysia (2026)',
  description: 'Panduan mudah pinjaman kereta (peraturan EIR baharu dari Jun 2026) dan pinjaman rumah, dengan kalkulator yang membandingkan ansuran dengan gaji bersih anda.',
  alternates: { canonical: '/ms/pinjaman/', languages: { en: '/loans/', ms: '/ms/pinjaman/' } },
};

export default function Page() {
  return <LoansGuide locale="ms" rules={loadMyRules()} />;
}
