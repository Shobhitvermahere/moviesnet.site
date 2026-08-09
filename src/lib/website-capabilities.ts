import type { Website, Language, Quality, StreamingSource, ContentCategory } from '@/types';
import { resolveWebsiteLogoUrl } from './website-logo';

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

export function websitesForCategory(websites: Website[], category: ContentCategory): Website[] {
  const byCategory: Record<ContentCategory, (w: Website) => boolean> = {
    movies: (w) => w.categories.includes('movies') || w.categories.includes('tv-shows'),
    'tv-shows': (w) => w.categories.includes('tv-shows') || w.categories.includes('movies'),
    anime: (w) => w.categories.includes('anime'),
    manga: (w) => w.categories.includes('manga'),
    sports: (w) => w.categories.includes('sports'),
    'live-tv': (w) => w.categories.includes('live-tv'),
    cartoons: (w) => w.categories.includes('cartoons') || w.categories.includes('anime'),
    documentaries: (w) => w.categories.includes('documentaries') || w.categories.includes('movies'),
  };

  const matcher = byCategory[category] || (() => true);
  const matched = websites.filter(matcher);
  return matched.length > 0 ? matched : websites;
}

export function buildWebsiteSearchUrl(website: Website, title: string): string {
  if (website.searchUrl?.includes('{query}')) {
    return website.searchUrl.replace('{query}', encodeURIComponent(title));
  }
  const base = website.homepageUrl.replace(/\/$/, '');
  return `${base}/search?q=${encodeURIComponent(title)}`;
}

export function websiteToStreamingSource(
  website: Website,
  title: string,
  responseTimeMs?: number | null
): StreamingSource {
  const qualities = inferWebsiteQualities(website);
  const languages: Language[] =
    website.languages.length > 0 ? website.languages : (['english', 'multi-audio'] as Language[]);

  return {
    websiteId: website.id,
    websiteName: website.name,
    websiteLogo: resolveWebsiteLogoUrl(website.homepageUrl, website.logoUrl),
    url: buildWebsiteSearchUrl(website, title),
    languages,
    subtitles: ['english'],
    quality: qualities,
    verified: website.healthStatus === 'healthy',
    responseTimeMs: responseTimeMs ?? null,
    reachable: responseTimeMs != null,
  };
}

/** Sort sources fastest-first; unreachable sites sink to the bottom (admin priority as tie-breaker). */
export function sortSourcesBySpeed(
  sources: StreamingSource[],
  priorityIndex: Map<string, number>
): StreamingSource[] {
  return [...sources].sort((a, b) => {
    const aMs = a.responseTimeMs ?? Number.POSITIVE_INFINITY;
    const bMs = b.responseTimeMs ?? Number.POSITIVE_INFINITY;
    if (aMs !== bMs) return aMs - bMs;
    return (priorityIndex.get(a.websiteId) ?? 999) - (priorityIndex.get(b.websiteId) ?? 999);
  });
}

export function buildPriorityIndex(websites: Website[]): Map<string, number> {
  const map = new Map<string, number>();
  websites.forEach((w, i) => map.set(w.id, i));
  return map;
}
