import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/adminshobhit/', '/api/'],
      },
    ],
    sitemap: 'https://moviesnet.online/sitemap.xml',
  };
}
