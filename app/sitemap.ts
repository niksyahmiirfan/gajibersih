import type { MetadataRoute } from 'next';
import { CLUSTER_SALARIES, salarySlug, SITE } from '@/lib/site';
import { listSharings } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ['/', '/ms/kalkulator-gaji-bersih/', '/methodology/', '/about/', '/privacy/', '/credit-cards/', '/ms/kad-kredit/', '/loans/', '/ms/pinjaman/', '/ms/perkongsian/',
    ...CLUSTER_SALARIES.map((s) => `/salary/${salarySlug(s)}/`), '/sharings/',
    ...listSharings('en').map((p) => `/sharings/${p.slug}/`)];
  return paths.map((p) => ({ url: SITE.url + p, lastModified: now }));
}
