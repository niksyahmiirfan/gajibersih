import type { Metadata } from 'next';
import { listSharings, SHARING_CATEGORIES } from '@/lib/content';
import { SharingsList } from '@/components/SharingsList';

export const metadata: Metadata = {
  title: 'Sharings: salary FAQs, saving tips and payroll updates',
  description: 'Short, practical reads on Malaysian salaries: payslip FAQs, saving tips and updates when EPF, PERKESO or tax rules change.',
  alternates: { canonical: '/sharings/' },
};

export default function SharingsPage() {
  const posts = listSharings('en');
  return (
    <>
      <h1>Sharings</h1>
      <p className="lead">Short, practical reads about your salary: payslip FAQs, saving tips, and updates when the rules change.</p>
      <SharingsList posts={posts} categories={SHARING_CATEGORIES} />
    </>
  );
}
