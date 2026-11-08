import type { Metadata } from 'next';
import { listSharings, SHARING_CATEGORIES } from '@/lib/content';
import { SharingsList } from '@/components/SharingsList';

export const metadata: Metadata = {
  title: 'Perkongsian: soalan gaji, tip menyimpan dan kemas kini',
  description: 'Bacaan ringkas tentang gaji di Malaysia: soalan lazim slip gaji, tip menyimpan dan kemas kini peraturan KWSP, PERKESO dan cukai.',
  alternates: { canonical: '/ms/perkongsian/', languages: { en: '/sharings/', ms: '/ms/perkongsian/' } },
};

export default function Page() {
  return (
    <div lang="ms">
      <h1>Perkongsian</h1>
      <p className="lead">Bacaan ringkas tentang gaji anda: soalan lazim, tip menyimpan dan kemas kini apabila peraturan berubah. Artikel kini dalam Bahasa Inggeris; versi BM akan menyusul.</p>
      <SharingsList posts={listSharings('en')} categories={SHARING_CATEGORIES} locale="ms" />
    </div>
  );
}
