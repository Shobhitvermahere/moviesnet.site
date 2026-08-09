import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Indexed Streaming Sites Directory',
  description:
    'Browse every movie, TV, anime, and live stream portal indexed by MoviesNet. See health status, categories, and open any site.',
  alternates: { canonical: absoluteUrl('/websites') },
  keywords: ['streaming sites list', 'movie sites directory', 'anime portals', 'moviesnet websites'],
};

export default function WebsitesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
