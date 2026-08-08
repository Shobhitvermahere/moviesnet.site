// ============================================================================
// AllSiteHub Search — Authoritative Metadata Pipeline
// Uses OMDb (free, reliable) as primary. TMDB as secondary if key is valid.
// ============================================================================
import { cache } from './cache';
import type { ContentCategory, ContentStatus } from '@/types';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'trilogy'; // Free demo key

// ---------------------------------------------------------------------------
// Exported Interfaces
// ---------------------------------------------------------------------------
export interface CastMember {
  name: string;
  character: string;
  profilePath: string | null;
}

export interface OfficialProvider {
  id: string;
  name: string;
  logo: string;
  url: string;
  type: 'flatrate' | 'rent' | 'buy';
}

export interface VerifiedMetadata {
  tmdbId?: number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  year: number | null;
  type: ContentStatus;
  category: ContentCategory;
  poster: string;
  backdrop: string | null;
  overview: string;
  genres: string[];
  runtime: string | null;
  seasonCount: number | null;
  episodeCount: number | null;
  rating: number | null;
  confidenceScore: number;
  cast?: CastMember[];
  trailerKey?: string | null;
  similarTitles?: { id: number; title: string; poster: string; year: number | null; rating: number | null }[];
  officialProviders?: OfficialProvider[];
}

// ---------------------------------------------------------------------------
// Query Normalization
// ---------------------------------------------------------------------------
export function normalizeQuery(query: string): string {
  if (!query) return '';
  return query
    .replace(/\\+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Title Similarity (0–100)
// ---------------------------------------------------------------------------
export function calculateTitleSimilarity(str1: string, str2: string): number {
  const s1 = normalizeQuery(str1).toLowerCase();
  const s2 = normalizeQuery(str2).toLowerCase();

  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;
  if (s1.startsWith(s2) || s2.startsWith(s1)) return 92;
  if (s1.includes(s2) || s2.includes(s1)) return 85;

  const tokens1 = new Set(s1.split(' ').filter((t) => t.length > 1));
  const tokens2 = new Set(s2.split(' ').filter((t) => t.length > 1));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let common = 0;
  tokens1.forEach((t) => { if (tokens2.has(t)) common++; });
  return Math.round((2.0 * common) / (tokens1.size + tokens2.size) * 100);
}

// ---------------------------------------------------------------------------
// Confidence Score (0–100)
// ---------------------------------------------------------------------------
export function calculateConfidenceScore(
  queryTitle: string,
  queryYear?: number | null,
  candidateTitle?: string,
  candidateYear?: number | null,
): number {
  let score = 0;
  const titleSim = calculateTitleSimilarity(queryTitle, candidateTitle || '');

  // Title match (60 pts)
  score += Math.round((titleSim / 100) * 60);

  // Year match (20 pts)
  if (queryYear && candidateYear) {
    if (queryYear === candidateYear) score += 20;
    else if (Math.abs(queryYear - candidateYear) <= 1) score += 10;
  } else if (!queryYear) {
    score += 15;
  }

  // Verified metadata bonus (20 pts)
  score += 20;

  return Math.min(100, Math.max(0, score));
}

function formatRuntimeStr(runtime: string | null | undefined): string | null {
  if (!runtime || runtime === 'N/A') return null;
  // OMDb gives "169 min" format — keep it clean
  const m = runtime.match(/(\d+)\s*min/i);
  if (m) {
    const mins = parseInt(m[1], 10);
    const h = Math.floor(mins / 60);
    const rem = mins % 60;
    if (h === 0) return `${rem}min`;
    if (rem === 0) return `${h}h`;
    return `${h}h ${rem}m`;
  }
  return runtime;
}

// ---------------------------------------------------------------------------
// OMDb Search — Real movie/TV data with correct posters, genres, runtime
// ---------------------------------------------------------------------------
interface OMDbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDbDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  imdbRating: string;
  imdbID: string;
  Type: string;
  totalSeasons?: string;
  Response: string;
}

async function searchOMDb(query: string): Promise<OMDbSearchResult[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.Response === 'True' && Array.isArray(data.Search)) {
      return data.Search;
    }
  } catch { /* timeout or network */ }
  return [];
}

async function getOMDbDetail(imdbId: string): Promise<OMDbDetail | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `http://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&plot=full&apikey=${OMDB_API_KEY}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.Response === 'True') return data as OMDbDetail;
  } catch { /* timeout */ }
  return null;
}

function omdbDetailToVerifiedMetadata(
  detail: OMDbDetail,
  queryTitle: string,
  confidenceScore: number
): VerifiedMetadata {
  const yearNum = parseInt(detail.Year) || null;
  const isMovie = detail.Type === 'movie';
  const genres = detail.Genre && detail.Genre !== 'N/A'
    ? detail.Genre.split(',').map((g: string) => g.trim())
    : [];
  const rating = detail.imdbRating && detail.imdbRating !== 'N/A'
    ? parseFloat(detail.imdbRating)
    : null;
  const runtime = formatRuntimeStr(detail.Runtime);
  const seasonCount = detail.totalSeasons && detail.totalSeasons !== 'N/A'
    ? parseInt(detail.totalSeasons, 10)
    : null;
  const cast: CastMember[] = detail.Actors && detail.Actors !== 'N/A'
    ? detail.Actors.split(',').map((name: string) => ({
        name: name.trim(),
        character: 'Cast',
        profilePath: null,
      }))
    : [];

  return {
    imdbId: detail.imdbID,
    title: detail.Title,
    originalTitle: detail.Title,
    year: yearNum,
    type: (isMovie ? 'movie' : 'series') as ContentStatus,
    category: (isMovie ? 'movies' : 'tv-shows') as ContentCategory,
    poster: detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : '',
    backdrop: null,
    overview: detail.Plot && detail.Plot !== 'N/A' ? detail.Plot : '',
    genres,
    runtime,
    seasonCount,
    episodeCount: null,
    rating,
    confidenceScore,
    cast,
  };
}

// ---------------------------------------------------------------------------
// TMDB Search (secondary — only used if TMDB_API_KEY is configured)
// ---------------------------------------------------------------------------
async function searchTMDB(query: string): Promise<VerifiedMetadata[]> {
  if (!TMDB_API_KEY) return [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return []; // Invalid API key or rate limited

    const data = await res.json();
    if (!Array.isArray(data?.results)) return [];

    const results: VerifiedMetadata[] = [];

    for (const item of data.results.slice(0, 8)) {
      const mediaType = item.media_type;
      if (mediaType !== 'movie' && mediaType !== 'tv') continue;

      const title = item.title || item.name || '';
      if (!title) continue;

      const releaseDate = item.release_date || item.first_air_date || '';
      const year = releaseDate ? parseInt(releaseDate.slice(0, 4), 10) || null : null;
      const poster = item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : '';
      const backdrop = item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : null;

      results.push({
        tmdbId: item.id,
        title,
        originalTitle: item.original_title || item.original_name || title,
        year,
        type: mediaType === 'movie' ? 'movie' : 'series',
        category: mediaType === 'movie' ? 'movies' : 'tv-shows',
        poster,
        backdrop,
        overview: item.overview || '',
        genres: [],
        runtime: null,
        seasonCount: null,
        episodeCount: null,
        rating: item.vote_average ? Number(Number(item.vote_average).toFixed(1)) : null,
        confidenceScore: calculateConfidenceScore(query, null, title, year),
      });
    }

    return results.filter(r => r.confidenceScore >= 60);
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// TVMaze Search (for TV shows fallback)
// ---------------------------------------------------------------------------
async function searchTVMaze(query: string): Promise<VerifiedMetadata[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.slice(0, 5).map((entry: any) => {
      const show = entry?.show;
      if (!show?.name) return null;

      const year = show.premiered ? parseInt(show.premiered.slice(0, 4), 10) || null : null;
      const image = show.image;
      const ratingObj = show.rating;

      return {
        title: show.name,
        originalTitle: show.name,
        year,
        type: String(show.status || '').toLowerCase().includes('end') ? 'completed' as ContentStatus : 'ongoing' as ContentStatus,
        category: 'tv-shows' as ContentCategory,
        poster: image?.original || image?.medium || '',
        backdrop: null,
        overview: show.summary ? show.summary.replace(/<[^>]*>/g, '') : '',
        genres: Array.isArray(show.genres) ? show.genres : [],
        runtime: show.averageRuntime ? `${show.averageRuntime}min` : null,
        seasonCount: null,
        episodeCount: null,
        rating: ratingObj?.average ? Number(ratingObj.average) : null,
        confidenceScore: calculateConfidenceScore(query, null, show.name, year),
      } as VerifiedMetadata;
    }).filter((r): r is VerifiedMetadata => r !== null && r.confidenceScore >= 50);
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// MAIN: Fetch Authoritative Verified Metadata
// Pipeline: OMDb (primary) → TMDB (secondary) → TVMaze (tertiary)
// ---------------------------------------------------------------------------
export async function fetchAuthoritativeMetadata(
  query: string,
  categoryFilter?: ContentCategory,
  imdbId?: string,
  posterHint?: string
): Promise<VerifiedMetadata[]> {
  const normalized = normalizeQuery(query);
  if (!normalized && !imdbId) return [];

  // Fast path: exact IMDb ID from suggestion click
  if (imdbId) {
    const imdbCacheKey = `metadata-v3:imdb:${imdbId}`;
    const imdbCached = cache.get<VerifiedMetadata[]>(imdbCacheKey);
    if (imdbCached && imdbCached.length > 0) return imdbCached;

    const detail = await getOMDbDetail(imdbId);
    if (detail) {
      const meta = omdbDetailToVerifiedMetadata(detail, normalized || detail.Title, 100);
      if (!meta.poster && posterHint) meta.poster = posterHint;
      const result = [meta];
      cache.set(imdbCacheKey, result, 30 * 60 * 1000);
      return result;
    }
  }

  const cacheKey = `metadata-v3:${normalized.toLowerCase()}:${categoryFilter || 'all'}`;
  const cached = cache.get<VerifiedMetadata[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  const results: VerifiedMetadata[] = [];

  // ---- Step 1: OMDb Search (primary — works for movies & TV) ----
  const omdbResults = await searchOMDb(normalized);

  if (omdbResults.length > 0) {
    // Get detailed info for top 6 matches in parallel
    const relevantResults = omdbResults.slice(0, 6);
    const detailPromises = relevantResults.map(async (item) => {
      const confidence = calculateConfidenceScore(normalized, null, item.Title, parseInt(item.Year) || null);
      if (confidence < 50) return null;

      // Fetch full details
      const detail = await getOMDbDetail(item.imdbID);
      if (!detail) {
        // Use search-level data
        const yearNum = parseInt(item.Year) || null;
        const isMovie = item.Type === 'movie';
        return {
          imdbId: item.imdbID,
          title: item.Title,
          originalTitle: item.Title,
          year: yearNum,
          type: (isMovie ? 'movie' : 'series') as ContentStatus,
          category: (isMovie ? 'movies' : 'tv-shows') as ContentCategory,
          poster: item.Poster !== 'N/A' ? item.Poster : '',
          backdrop: null,
          overview: '',
          genres: [],
          runtime: null,
          seasonCount: null,
          episodeCount: null,
          rating: null,
          confidenceScore: confidence,
        } as VerifiedMetadata;
      }

      return omdbDetailToVerifiedMetadata(detail, normalized, confidence);
    });

    const settled = await Promise.allSettled(detailPromises);
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value) {
        results.push(r.value);
      }
    }
  }

  // ---- Step 2: TMDB Search (secondary — if valid key, merges additional data) ----
  if (TMDB_API_KEY) {
    const tmdbResults = await searchTMDB(normalized);
    for (const tmdbItem of tmdbResults) {
      // Only add if we don't already have this title from OMDb
      const exists = results.some(r =>
        calculateTitleSimilarity(r.title, tmdbItem.title) >= 85 &&
        (!r.year || !tmdbItem.year || Math.abs(r.year - tmdbItem.year) <= 1)
      );
      if (!exists) {
        results.push(tmdbItem);
      } else {
        // Merge TMDB poster/backdrop into existing OMDb result if it has better images
        const existing = results.find(r =>
          calculateTitleSimilarity(r.title, tmdbItem.title) >= 85
        );
        if (existing) {
          if (tmdbItem.poster && !existing.poster) existing.poster = tmdbItem.poster;
          if (tmdbItem.backdrop) existing.backdrop = tmdbItem.backdrop;
          if (tmdbItem.tmdbId) existing.tmdbId = tmdbItem.tmdbId;
          if (tmdbItem.trailerKey) existing.trailerKey = tmdbItem.trailerKey;
          if (tmdbItem.similarTitles) existing.similarTitles = tmdbItem.similarTitles;
          if (tmdbItem.officialProviders) existing.officialProviders = tmdbItem.officialProviders;
        }
      }
    }
  }

  // ---- Step 3: TVMaze fallback (if we still have < 2 results) ----
  if (results.length < 2) {
    const tvmazeResults = await searchTVMaze(normalized);
    for (const tvItem of tvmazeResults) {
      const exists = results.some(r =>
        calculateTitleSimilarity(r.title, tvItem.title) >= 85
      );
      if (!exists) results.push(tvItem);
    }
  }

  // Filter by category if specified
  let filtered = results;
  if (categoryFilter) {
    const catFiltered = results.filter(r => r.category === categoryFilter);
    if (catFiltered.length > 0) filtered = catFiltered;
  }

  // Sort by confidence score descending
  filtered.sort((a, b) => b.confidenceScore - a.confidenceScore);

  if (filtered.length > 0) {
    cache.set(cacheKey, filtered, 30 * 60 * 1000);
  }

  return filtered;
}
