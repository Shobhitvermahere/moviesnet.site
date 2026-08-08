import { CATEGORIES } from '@/lib/utils';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryPageClient from './CategoryPageClient';

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} — Search ${category.name}`,
    description: `Search for ${category.name.toLowerCase()} across all indexed websites. ${category.description}`,
    openGraph: {
      title: `${category.name} | MoviesNet`,
      description: `Discover ${category.name.toLowerCase()} across multiple websites instantly.`,
    },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) notFound();

  return <CategoryPageClient category={category} />;
}
