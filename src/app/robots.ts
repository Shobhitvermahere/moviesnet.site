import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/search', '/watch/', '/categories/'],
        disallow: ['/adminshobhit/', '/api/'],
      },
    ],
    host: 'https://moviesnet.site',
    sitemap: 'https://moviesnet.site/sitemap.xml',
  };
}
