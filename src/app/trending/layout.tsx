import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Trending Movies, TV & Anime',
  description:
    'See what is trending across MoviesNet categories — popular movies, series, and anime titles to search next.',
  alternates: { canonical: absoluteUrl('/trending') },
  keywords: ['trending movies', 'trending anime', 'popular tv shows', 'moviesnet trending'],
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
