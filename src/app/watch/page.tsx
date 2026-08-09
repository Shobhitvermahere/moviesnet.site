import Link from 'next/link';
import { SEO_TITLES } from '@/lib/seo-titles';
import { absoluteUrl } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export default function WatchIndexPage() {
  return (
    <div className="page-shell mx-auto page-gutter py-10 sm:py-14 max-w-4xl">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Where to Watch Guides',
          url: absoluteUrl('/watch'),
          description: 'Popular movie, TV, and anime watch guides on MoviesNet.',
        }}
      />
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
        Where to Watch — Popular Titles
      </h1>
      <p className="text-white/55 mb-10 leading-relaxed">
        Pick a title to see a dedicated guide, then search every indexed streaming portal in one click.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SEO_TITLES.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/watch/${entry.slug}`}
              className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 hover:border-[#e8b86d]/35 hover:text-[#e8b86d] transition-colors"
            >
              Where to watch {entry.title}
              {entry.year ? ` (${entry.year})` : ''}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
