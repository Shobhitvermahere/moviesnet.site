import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Watch Guides — Popular Movies & Shows',
  description:
    'Find where to watch popular movies, TV series, and anime. MoviesNet watch guides link to our unified search across every indexed portal.',
  alternates: { canonical: absoluteUrl('/watch') },
};

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
