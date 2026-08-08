// ============================================================================
// AllSiteHub Search — Core Search Engine
// ============================================================================
import type { SearchResult, SearchFilters, SearchResponse, Website, Language, SubtitleLanguage, Quality, StreamingSource } from '@/types';
import { getPublicWebsites, addSearchQuery, getWebsiteById } from './db';
import { cache } from './cache';
import { findClosestMatch, resolveMoviePoster, slugify } from './utils';
import { websiteToStreamingSource } from './website-capabilities';

// Search dictionary for spell correction
const COMMON_TITLES = [
  'naruto', 'one piece', 'dragon ball', 'attack on titan', 'demon slayer',
  'jujutsu kaisen', 'my hero academia', 'death note', 'fullmetal alchemist',
  'hunter x hunter', 'bleach', 'one punch man', 'mob psycho', 'spy x family',
  'chainsaw man', 'vinland saga', 'tokyo ghoul', 'sword art online',
  'avengers', 'batman', 'spider-man', 'joker', 'inception', 'interstellar',
  'the dark knight', 'oppenheimer', 'barbie', 'dune', 'avatar',
  'breaking bad', 'game of thrones', 'stranger things', 'the witcher',
  'squid game', 'wednesday', 'the mandalorian', 'house of the dragon',
  'the last of us', 'succession', 'ted lasso', 'the bear',
];

import { fetchAuthoritativeMetadata, normalizeQuery, type VerifiedMetadata } from './tmdb';

// ============================================================================
// Execute search — ONE unified result per TMDB title, not 109 fake cards
// ============================================================================
export async function executeSearch(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResponse> {
  const startTime = Date.now();

  if (!query || query.trim().length === 0) {
    return {
      results: [],
      totalResults: 0,
      query,
      filters,
      suggestions: [],
      correction: null,
      searchTime: 0,
      websitesSearched: 0,
      page,
      hasMore: false,
    };
  }

  const normalizedQ = normalizeQuery(query);

  // Check cache first
  const cacheKey = `search-v7:${normalizedQ}:${filters.imdbId || ''}:${JSON.stringify(filters)}:${page}:${pageSize}`;
  const cached = cache.get<SearchResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Track search query
  addSearchQuery(query.trim());

  // Public directory websites sorted by admin priority (search order)
  let websites = getPublicWebsites().sort((a, b) => a.priority - b.priority);

  // Filter by website if specified
  if (filters.website) {
    websites = websites.filter((w) => w.id === filters.website || w.slug === filters.website);
  }

  // Filter by category if specified
  if (filters.category) {
    websites = websites.filter((w) => w.categories.includes(filters.category!));
  }

  const websitesSearched = websites.length;

  // ---------------------------------------------------------------------------
  // 1. Fetch Verified TMDB Authoritative Metadata
  // ---------------------------------------------------------------------------
  const verifiedMediaList = await fetchAuthoritativeMetadata(
    normalizedQ,
    filters.category,
    filters.imdbId,
    filters.posterHint
  );

  let allResults: SearchResult[] = [];

  if (verifiedMediaList.length > 0) {
    for (let mIdx = 0; mIdx < verifiedMediaList.length; mIdx++) {
      const media = verifiedMediaList[mIdx];
      allResults.push(buildUnifiedResult(media, websites, mIdx, filters.category, filters.posterHint));
    }
  }

  // If TMDB returned nothing, try fallback external APIs (iTunes, TVMaze, Jikan)
  if (allResults.length === 0) {
    const mediaItems = await fetchFallbackMedia(query, filters.category);
    for (let mIdx = 0; mIdx < mediaItems.length; mIdx++) {
      const item = mediaItems[mIdx];
      const category = filters.category || 'movies';
      const poster = item.poster || resolveMoviePoster(item.title, category, mIdx);

      const sources = websites.map((w) => websiteToStreamingSource(w, item.title));
      const primarySite = websites[0];

      allResults.push({
        id: `fallback-${mIdx}-${slugify(item.title)}`,
        title: item.title,
        poster,
        websiteId: primarySite?.id || 'unknown',
        websiteName: primarySite?.name || 'Unknown',
        websiteLogo: primarySite?.logoUrl || '',
        url: primarySite?.searchUrl
          ? primarySite.searchUrl.replace('{query}', encodeURIComponent(item.title))
          : `${primarySite?.homepageUrl || '#'}/search?q=${encodeURIComponent(item.title)}`,
        sources,
        languages: aggregateLanguages(sources),
        subtitles: ['english'] as SubtitleLanguage[],
        quality: aggregateQualities(sources),
        episodeCount: null,
        seasonCount: null,
        runtime: null,
        status: item.status || 'movie',
        genres: item.genres.length > 0 ? item.genres : ['Unknown'],
        rating: item.rating,
        year: item.year,
        lastUpdated: new Date().toISOString().split('T')[0],
        verified: false,
        category,
      });
    }
  }

  // Apply filters
  allResults = applyFilters(allResults, filters);

  // Remove duplicates by title
  allResults = deduplicateResults(allResults);

  // Sort results
  allResults = sortResults(allResults, filters.sort || 'popularity');

  // Spell correction
  const correction = findClosestMatch(normalizedQ, COMMON_TITLES);

  // Generate suggestions
  const suggestions = generateSuggestions(normalizedQ);

  // Pagination
  const totalResults = allResults.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = allResults.slice(startIndex, startIndex + pageSize);

  const candidates = verifiedMediaList.length > 1 ? verifiedMediaList.map((m) => ({
    tmdbId: m.tmdbId,
    title: m.title,
    originalTitle: m.originalTitle,
    year: m.year,
    type: m.type,
    category: m.category,
    poster: m.poster,
    backdrop: m.backdrop,
    overview: m.overview,
    confidenceScore: m.confidenceScore,
  })) : undefined;

  const response: SearchResponse = {
    results: paginatedResults,
    candidates,
    totalResults,
    query,
    filters,
    suggestions,
    correction: correction !== normalizedQ ? correction : null,
    searchTime: Date.now() - startTime,
    websitesSearched,
    page,
    hasMore: startIndex + pageSize < totalResults,
  };

  // Cache for 5 minutes
  cache.set(cacheKey, response, 5 * 60 * 1000);

  return response;
}

// ============================================================================
// Fallback media fetcher (iTunes + TVmaze + Jikan) — only used when TMDB fails
// ============================================================================
interface FallbackMediaItem {
  title: string;
  poster: string;
  rating: number | null;
  year: number | null;
  genres: string[];
  status?: 'completed' | 'ongoing' | 'movie' | 'series';
}

async function fetchFallbackMedia(query: string, category?: string): Promise<FallbackMediaItem[]> {
  const cacheKey = `fallback-media-v2:${query.toLowerCase()}:${category || 'all'}`;
  const cached = cache.get<FallbackMediaItem[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  const items: FallbackMediaItem[] = [];

  const fetches = [
    // iTunes API for Movies
    (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2200);
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=5`, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.results)) {
            return data.results.map((m: any) => {
              let year: number | null = null;
              if (m.releaseDate && typeof m.releaseDate === 'string') {
                const y = parseInt(m.releaseDate.slice(0, 4), 10);
                if (!isNaN(y)) year = y;
              }
              const poster = typeof m.artworkUrl100 === 'string'
                ? m.artworkUrl100.replace('100x100bb', '600x600bb')
                : '';
              return {
                title: String(m.trackName || m.collectionName || ''),
                poster,
                rating: null,
                year,
                genres: m.primaryGenreName ? [String(m.primaryGenreName)] : [],
                status: 'movie' as const,
              };
            }).filter((i: FallbackMediaItem) => Boolean(i.title));
          }
        }
      } catch { /* fallback */ }
      return [];
    })(),

    // TVmaze API for TV Series
    (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2200);
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data.slice(0, 5).map((entry: any) => {
              const show = entry?.show;
              if (!show || !show.name) return null;
              let year: number | null = null;
              if (show.premiered && typeof show.premiered === 'string') {
                const y = parseInt(show.premiered.slice(0, 4), 10);
                if (!isNaN(y)) year = y;
              }
              const image = show.image;
              const ratingObj = show.rating;
              return {
                title: String(show.name),
                poster: image?.original || image?.medium || '',
                rating: ratingObj?.average ? Number(ratingObj.average) : null,
                year,
                genres: Array.isArray(show.genres) ? show.genres : [],
                status: String(show.status || '').toLowerCase().includes('end') ? 'completed' as const : 'ongoing' as const,
              };
            }).filter((i: FallbackMediaItem | null): i is FallbackMediaItem => i !== null);
          }
        }
      } catch { /* fallback */ }
      return [];
    })(),
  ];

  const results = await Promise.allSettled(fetches);
  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      items.push(...res.value);
    }
  }

  // Relevance filtering
  const normalizedQ = query.trim().toLowerCase();
  const qTokens = normalizedQ.split(/\s+/).filter(Boolean);
  const relevantItems = items.filter((item) => {
    const itemTitle = item.title.toLowerCase();
    return qTokens.some((tok) => itemTitle.includes(tok));
  });

  const sortedItems = (relevantItems.length > 0 ? relevantItems : items).sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aExact = aTitle === normalizedQ;
    const bExact = bTitle === normalizedQ;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  if (sortedItems.length > 0) {
    cache.set(cacheKey, sortedItems, 10 * 60 * 1000);
  }

  return sortedItems;
}

function aggregateLanguages(sources: StreamingSource[]): Language[] {
  const langs = new Set<Language>();
  for (const s of sources) s.languages.forEach((l) => langs.add(l));
  return langs.size > 0 ? [...langs] : (['english'] as Language[]);
}

function aggregateQualities(sources: StreamingSource[]): Quality[] {
  const order: Quality[] = ['4k', '2k', '1080p', '720p', '480p'];
  const found = new Set<Quality>();
  for (const s of sources) s.quality.forEach((q) => found.add(q));
  return order.filter((q) => found.has(q));
}

function buildUnifiedResult(
  media: VerifiedMetadata,
  websites: Website[],
  mIdx: number,
  filterCategory?: string,
  posterHint?: string
): SearchResult {
  const category = media.category || filterCategory || 'movies';
  // Search every site in the directory (admin priority order)
  const sources = websites.map((w) => websiteToStreamingSource(w, media.title));
  const primary = sources[0];
  const poster = media.poster || posterHint || resolveMoviePoster(media.title, category, mIdx);

  return {
    id: `tmdb-${media.tmdbId || mIdx}-${slugify(media.title)}`,
    title: media.title,
    originalTitle: media.originalTitle,
    poster,
    backdrop: media.backdrop,
    websiteId: primary?.websiteId || 'unknown',
    websiteName: primary?.websiteName || 'Unknown',
    websiteLogo: primary?.websiteLogo || '',
    url: primary?.url || '#',
    sources,
    languages: aggregateLanguages(sources),
    subtitles: ['english'] as SubtitleLanguage[],
    quality: aggregateQualities(sources),
    episodeCount: media.episodeCount,
    seasonCount: media.seasonCount,
    runtime: media.runtime,
    status: media.type,
    genres: media.genres,
    rating: media.rating,
    year: media.year,
    overview: media.overview,
    tmdbId: media.tmdbId,
    imdbId: media.imdbId,
    confidenceScore: media.confidenceScore,
    cast: media.cast,
    trailerKey: media.trailerKey,
    similarTitles: media.similarTitles,
    officialProviders: media.officialProviders,
    lastUpdated: new Date().toISOString().split('T')[0],
    verified: true,
    category,
  };
}

// Apply filters to results
function applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
  return results
    .map((r) => {
      let sources = r.sources || [];

      if (filters.website) {
        sources = sources.filter(
          (s) => s.websiteId === filters.website || s.websiteName.toLowerCase() === filters.website?.toLowerCase()
        );
      }
      if (filters.language) {
        sources = sources.filter((s) => s.languages.includes(filters.language!));
      }
      if (filters.quality) {
        sources = sources.filter((s) => s.quality.includes(filters.quality!));
      }

      if (filters.website || filters.language || filters.quality) {
        if (sources.length === 0) return null;
        const primary = sources[0];
        return {
          ...r,
          sources,
          websiteId: primary.websiteId,
          websiteName: primary.websiteName,
          websiteLogo: primary.websiteLogo,
          url: primary.url,
          languages: aggregateLanguages(sources),
          quality: aggregateQualities(sources),
        };
      }
      return r;
    })
    .filter((r): r is SearchResult => {
      if (!r) return false;
      if (filters.subtitle && !r.subtitles.includes(filters.subtitle)) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.category && r.category !== filters.category) {
        const hasCategorySite = (r.sources || []).some((s) => {
          const site = getWebsiteById(s.websiteId);
          return site?.categories.includes(filters.category!);
        });
        if (!hasCategorySite) return false;
      }
      return true;
    });
}

// One result per unique title
function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const unique: SearchResult[] = [];

  for (const result of results) {
    const key = result.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }

  return unique;
}

// Sort results
function sortResults(results: SearchResult[], sort: string): SearchResult[] {
  switch (sort) {
    case 'latest':
      return results.sort((a, b) => {
        if (!a.lastUpdated || !b.lastUpdated) return 0;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
    case 'highest-quality': {
      const qualityOrder = ['4k', '2k', '1080p', '720p', '480p'];
      return results.sort((a, b) => {
        const aQ = Math.min(...a.quality.map((q) => qualityOrder.indexOf(q)).filter((i) => i >= 0), 999);
        const bQ = Math.min(...b.quality.map((q) => qualityOrder.indexOf(q)).filter((i) => i >= 0), 999);
        return aQ - bQ;
      });
    }
    case 'most-sources':
      return results.sort((a, b) => (b.sources?.length || 0) - (a.sources?.length || 0));
    case 'popularity':
    default:
      return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
}

// Generate search suggestions
function generateSuggestions(query: string): string[] {
  return COMMON_TITLES
    .filter((title) => title.includes(query) && title !== query)
    .slice(0, 5);
}

// Get trending content
export function getTrendingContent(): SearchResult[] {
  const cached = cache.get<SearchResult[]>('trending-content');
  if (cached) return cached;
  return [];
}
