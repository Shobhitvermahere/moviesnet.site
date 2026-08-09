import type { MetadataRoute } from 'next';
import { SEO_TITLES } from '@/lib/seo-titles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://moviesnet.site';
  const now = new Date();

  const categories = [
    'anime',
    'movies',
    'tv-shows',
    'manga',
    'cartoons',
    'documentaries',
    'sports',
    'live-tv',
  ];

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/watch`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/websites`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/trending`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/themes`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.75,
  }));

  const watchPages: MetadataRoute.Sitemap = SEO_TITLES.map((entry) => ({
    url: `${baseUrl}/watch/${entry.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...watchPages];
}
