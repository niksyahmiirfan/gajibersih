import type { Metadata } from 'next';
import { loadCards } from '@/lib/cards';
import { CreditCardsGuide } from '@/components/cards/CreditCardsGuide';

export const metadata: Metadata = {
  title: 'Panduan kad kredit untuk pemula di Malaysia (2026)',
  description: 'Cara kad kredit berfungsi, kos sebenar faedah, kalkulator bayaran minimum dan pencari kad untuk pemohon kali pertama di Malaysia.',
  alternates: { canonical: '/ms/kad-kredit/', languages: { en: '/credit-cards/', ms: '/ms/kad-kredit/' } },
};

export default function Page() {
  return <CreditCardsGuide locale="ms" data={loadCards()} />;
}
