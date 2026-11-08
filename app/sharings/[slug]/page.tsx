import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listSharings, loadContent } from '@/lib/content';
import { SITE } from '@/lib/site';
import { AdSlot } from '@/components/AdSlot';

export const dynamicParams = false;
export function generateStaticParams() {
  const posts = listSharings('en');
  // Next's static export needs at least one param; a placeholder 404s if there are no posts yet.
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: '_none' }];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = listSharings('en').find((p) => p.slug === slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/sharings/${slug}/` },
    openGraph: { type: 'article', publishedTime: meta.date },
  };
}

export default async function SharingPost({ params }: Props) {
  const { slug } = await params;
  const meta = listSharings('en').find((p) => p.slug === slug);
  const doc = meta && loadContent('en', 'sharings', slug);
  if (!meta || !doc) notFound();

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: meta.title, description: meta.description,
    datePublished: meta.date, dateModified: doc.updated || meta.date, publisher: { '@type': 'Organization', name: SITE.name },
  };
  const others = listSharings('en').filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article className="prose">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p><Link href="/sharings/">← Sharings</Link></p>
      <span className="tag">{meta.category}</span>
      <h1>{meta.title}</h1>
      <p className="updated">{meta.date} · {meta.readingMinutes} min read{doc.updated && doc.updated !== meta.date ? ` · Updated ${doc.updated}` : ''}</p>
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
      {doc.sources.length > 0 && (
        <p className="small muted">Sources: {doc.sources.map((s, i) => <span key={s}>{i > 0 && ' · '}<a href={s}>{new URL(s).hostname}</a></span>)}</p>
      )}
      <AdSlot slot="0000000003" />
      {others.length > 0 && (<>
        <h2>More sharings</h2>
        <ul>{others.map((o) => <li key={o.slug}><Link href={`/sharings/${o.slug}/`}>{o.title}</Link></li>)}</ul>
      </>)}
    </article>
  );
}
