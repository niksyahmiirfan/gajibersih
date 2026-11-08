import type { Metadata } from 'next';
import { loadCards } from '@/lib/cards';
import { alternates } from '@/lib/routes';
import { CreditCardsGuide } from '@/components/cards/CreditCardsGuide';

export const metadata: Metadata = {
  title: 'Credit cards explained for first-timers in Malaysia (2026)',
  description: 'How credit cards work, what interest really costs, a minimum-payment calculator and a card finder for first-time applicants in Malaysia.',
  alternates: alternates('/credit-cards/'),
};

export default function Page() {
  return <CreditCardsGuide locale="en" data={loadCards()} />;
}
