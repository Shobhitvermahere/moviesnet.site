import type { Website, Language, Quality, StreamingSource } from '@/types';

const POPULARITY_4K_THRESHOLD = 90;
const POPULARITY_1080_THRESHOLD = 70;

export function inferWebsiteQualities(website: Website): Quality[] {
  const tags = (website as Website & { tags?: string[] }).tags || [];
  if (tags.some((t) => /4k|uhd/i.test(t))) return ['4k', '1080p', '720p'];
  if (website.popularity >= POPULARITY_4K_THRESHOLD) return ['4k', '1080p', '720p'];
  if (website.popularity >= POPULARITY_1080_THRESHOLD) return ['1080p', '720p'];
  if (website.categories.includes('anime')) return ['1080p', '720p'];
  return ['1080p', '720p', '480p'];
}

export function formatLanguageLabel(lang: Language): string {
  return lang
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildWebsiteSearchUrl(website: Website, title: string): string {
  if (website.searchUrl?.includes('{query}')) {
    return website.searchUrl.replace('{query}', encodeURIComponent(title));
  }
  const base = website.homepageUrl.replace(/\/$/, '');
  return `${base}/search?q=${encodeURIComponent(title)}`;
}

export function websiteToStreamingSource(website: Website, title: string): StreamingSource {
  const qualities = inferWebsiteQualities(website);
  const languages: Language[] =
    website.languages.length > 0 ? website.languages : (['english', 'multi-audio'] as Language[]);

  return {
    websiteId: website.id,
    websiteName: website.name,
    websiteLogo: website.logoUrl,
    url: buildWebsiteSearchUrl(website, title),
    languages,
    subtitles: ['english'],
    quality: qualities,
    verified: website.healthStatus === 'healthy',
  };
}
