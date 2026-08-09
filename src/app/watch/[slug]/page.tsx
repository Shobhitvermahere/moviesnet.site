import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SEO_TITLES, getTitleBySlug } from '@/lib/seo-titles';
import {
  buildWatchPageMetadata,
  breadcrumbJsonLd,
  creativeWorkJsonLd,
  absoluteUrl,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export function generateStaticParams() {
  return SEO_TITLES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getTitleBySlug(slug);
  if (!entry) return { title: 'Title Not Found' };
  return buildWatchPageMetadata(entry);
}

export default async function WatchTitlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getTitleBySlug(slug);
  if (!entry) notFound();

  const searchUrl = `/search?q=${encodeURIComponent(entry.title)}`;
  const categoryLabel =
    entry.category === 'tv-shows'
      ? 'TV Shows'
      : entry.category.charAt(0).toUpperCase() + entry.category.slice(1).replace('-', ' ');

  return (
    <article className="page-shell mx-auto page-gutter py-10 sm:py-14 max-w-3xl">
      <JsonLd
        data={[
          creativeWorkJsonLd(entry),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Watch', path: '/search' },
            { name: entry.title, path: `/watch/${entry.slug}` },
          ]),
        ]}
      />

      <p className="text-xs font-bold uppercase tracking-widest text-[#e8b86d]/70 mb-3">
        Where to watch · {categoryLabel}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
        Where to Watch {entry.title}
        {entry.year ? ` (${entry.year})` : ''} Online
      </h1>
      <p className="text-base text-white/55 leading-relaxed mb-8">
        {entry.blurb ||
          `Use MoviesNet to find "${entry.title}" across every indexed ${categoryLabel.toLowerCase()} portal. We search your curated directory and rank the fastest sites so you can open the original source in one click.`}
      </p>

      <Link
        href={searchUrl}
        className="inline-flex items-center justify-center rounded-xl bg-[#e8b86d] text-[#1a1208] font-bold px-6 py-3.5 hover:bg-[#f0c987] transition-colors"
      >
        Search &ldquo;{entry.title}&rdquo; on MoviesNet
      </Link>

      <section className="mt-12 border-t border-white/10 pt-8">
        <h2 className="font-display text-lg font-semibold text-white mb-4">More ways to explore</h2>
        <ul className="space-y-2 text-sm text-white/50">
          <li>
            <Link href={`/categories/${entry.category}`} className="text-[#e8b86d] hover:underline">
              Browse all {categoryLabel} sites
            </Link>
          </li>
          <li>
            <Link href="/search" className="text-[#e8b86d] hover:underline">
              Open the full search engine
            </Link>
          </li>
          <li>
            <Link href="/websites" className="text-[#e8b86d] hover:underline">
              View the complete site directory
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-white/30 leading-relaxed">
        MoviesNet is a discovery engine. We do not host or stream copyrighted content. Results link to
        third-party sources at {absoluteUrl(searchUrl)}.
      </p>
    </article>
  );
}
