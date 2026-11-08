import type { Metadata } from 'next';
import { loadMyRules } from '@/lib/rules';
import { alternates } from '@/lib/routes';
import { LoansGuide } from '@/components/loans/LoansGuide';

export const metadata: Metadata = {
  title: 'First car loan & home loan guide for Malaysia (2026)',
  description: 'Plain-English guide to car loans (new EIR rules from June 2026) and home loans, with calculators that compare the instalment to your take-home pay.',
  alternates: alternates('/loans/'),
};

export default function Page() {
  return <LoansGuide locale="en" rules={loadMyRules()} />;
}
