import { CATEGORIES } from '@/lib/utils';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryPageClient from './CategoryPageClient';
import { absoluteUrl } from '@/lib/seo';

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  movies: ['watch movies online', 'movie search', 'find movies streaming', 'where to watch movies'],
  'tv-shows': ['tv show search', 'watch tv series online', 'find tv shows', 'series finder'],
  anime: ['anime search', 'watch anime online', 'find anime sites', 'anime streaming directory'],
  manga: ['manga search', 'read manga online finder', 'manga sites directory'],
  sports: ['live sports streams', 'sports streaming search', 'watch sports online'],
  'live-tv': ['live tv channels', 'live tv search', 'watch live tv online'],
  cartoons: ['cartoon search', 'watch cartoons online'],
  documentaries: ['documentary search', 'watch documentaries online'],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: 'Category Not Found' };

  const canonical = absoluteUrl(`/categories/${slug}`);

  return {
    title: `${category.name} Search — Find ${category.name} Across All Sites`,
    description: `Search ${category.name.toLowerCase()} across every indexed portal on MoviesNet. ${category.description} Discover titles fast and open original sources.`,
    keywords: CATEGORY_KEYWORDS[slug] || [category.name, 'moviesnet', 'search'],
    alternates: { canonical },
    openGraph: {
      title: `${category.name} | MoviesNet`,
      description: `Discover ${category.name.toLowerCase()} across multiple websites instantly.`,
      url: canonical,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  return <CategoryPageClient category={category} />;
}
