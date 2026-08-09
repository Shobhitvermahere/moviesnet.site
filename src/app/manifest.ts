import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MoviesNet — Search Once. Find Everywhere.',
    short_name: 'MoviesNet',
    description: 'Find movies, TV shows, anime, and live streams across curated portals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#03050a',
    theme_color: '#03050a',
    icons: [
      {
        src: '/logo-mark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
