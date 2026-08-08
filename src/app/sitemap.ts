import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://moviesnet.online';

  const categories = [
    'anime', 'movies', 'tv-shows', 'cartoons', 'documentaries', 'sports', 'live-tv'
  ];

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'always' as const, priority: 0.9 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.8 },
    { url: `${baseUrl}/themes`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/websites`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
  ];

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages];
}
