import { cache } from './cache';
import type { LiveShowcaseItem } from './trending-showcase';

const IMDB_CHART_URL = 'https://www.imdb.com/chart/moviemeter/';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'trilogy';
const DAY_MS = 24 * 60 * 60 * 1000;

const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

interface ImdbChartEntry {
  imdbId: string;
  title: string;
  year: number;
  rating: string;
  poster: string;
  genres: string[];
  synopsis: string;
}

function todayCacheKey(): string {
  return `imdb-moviemeter:${new Date().toISOString().slice(0, 10)}`;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

function parseImdbChartHtml(html: string, limit = 12): ImdbChartEntry[] {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return [];

  let data: unknown;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const pageProps = (data as { props?: { pageProps?: Record<string, unknown> } })?.props?.pageProps;
  const pageData = (pageProps?.pageData || pageProps) as Record<string, unknown> | undefined;
  const chartTitles = pageData?.chartTitles as { edges?: unknown[] } | undefined;
  const edges = chartTitles?.edges;
  if (!Array.isArray(edges)) return [];

  const items: ImdbChartEntry[] = [];

  for (const edge of edges) {
    if (items.length >= limit) break;
    const node = (edge as { node?: Record<string, unknown> })?.node;
    if (!node) continue;

    const rawId = String(node.id || node.const || '');
    const imdbId = rawId.startsWith('tt') ? rawId : '';
    if (!imdbId) continue;

    const title =
      (node.titleText as { text?: string } | undefined)?.text ||
      (node.originalTitleText as { text?: string } | undefined)?.text ||
      (node.title as string | undefined) ||
      '';
    if (!title) continue;

    const year =
      (node.releaseYear as { year?: number } | undefined)?.year ||
      (node.year as number | undefined) ||
      new Date().getFullYear();

    const ratingValue =
      (node.ratingsSummary as { aggregateRating?: number } | undefined)?.aggregateRating ??
      (node.rating as { aggregateRating?: number } | undefined)?.aggregateRating;
    const rating = ratingValue ? Number(ratingValue).toFixed(1) : '—';

    const poster =
      (node.primaryImage as { url?: string } | undefined)?.url ||
      (node.image as { url?: string } | undefined)?.url ||
      '';

    const genreNodes =
      (node.genres as { genres?: { text?: string }[] } | undefined)?.genres ||
      (Array.isArray(node.genres) ? (node.genres as { text?: string }[]) : []);
    const genres = genreNodes
      .map((g) => g.text || '')
      .filter(Boolean)
      .slice(0, 3);

    const synopsisRaw =
      (node.plot as { plotText?: { plainText?: string } } | undefined)?.plotText?.plainText ||
      (node.plot as { plainText?: string } | undefined)?.plainText ||
      '';
    const synopsis = synopsisRaw ? stripHtml(synopsisRaw).slice(0, 140) : 'Trending on IMDb Moviemeter.';

    items.push({
      imdbId,
      title,
      year,
      rating,
      poster,
      genres: genres.length > 0 ? genres : ['Drama'],
      synopsis,
    });
  }

  return items;
}

async function fetchImdbMoviemeterChart(limit = 12): Promise<ImdbChartEntry[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(IMDB_CHART_URL, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    clearTimeout(timer);

    if (!res.ok) return [];
    const html = await res.text();
    if (!html || html.length < 5000) return [];
    return parseImdbChartHtml(html, limit);
  } catch {
    return [];
  }
}

async function fetchTmdbTrendingMovies(limit = 12): Promise<ImdbChartEntry[]> {
  if (!TMDB_API_KEY) return [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`,
      { signal: controller.signal, next: { revalidate: 86400 } }
    );
    clearTimeout(timer);
    if (!res.ok) return [];

    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results.slice(0, limit) : [];

    const items: ImdbChartEntry[] = [];
    for (const movie of results) {
      const title = movie.title || movie.name;
      if (!title) continue;

      let imdbId = '';
      if (movie.id) {
        try {
          const extRes = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${TMDB_API_KEY}`,
            { next: { revalidate: 86400 } }
          );
          if (extRes.ok) {
            const ext = await extRes.json();
            imdbId = ext.imdb_id || '';
          }
        } catch {
          // optional enrichment
        }
      }

      const year = movie.release_date ? parseInt(String(movie.release_date).slice(0, 4), 10) : new Date().getFullYear();
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '';
      const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '—';

      items.push({
        imdbId,
        title,
        year: Number.isFinite(year) ? year : new Date().getFullYear(),
        rating,
        poster,
        genres: ['Movie'],
        synopsis: movie.overview ? stripHtml(movie.overview).slice(0, 140) : 'Trending movie today.',
      });
    }

    return items;
  } catch {
    return [];
  }
}

async function enrichFromOmdb(entry: ImdbChartEntry): Promise<ImdbChartEntry> {
  if (!entry.imdbId) return entry;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://www.omdbapi.com/?i=${encodeURIComponent(entry.imdbId)}&plot=short&apikey=${OMDB_API_KEY}`,
      { signal: controller.signal, next: { revalidate: 86400 } }
    );
    clearTimeout(timer);
    if (!res.ok) return entry;

    const detail = await res.json();
    if (detail.Response !== 'True') return entry;

    return {
      imdbId: entry.imdbId,
      title: detail.Title || entry.title,
      year: parseInt(detail.Year, 10) || entry.year,
      rating:
        detail.imdbRating && detail.imdbRating !== 'N/A'
          ? Number(detail.imdbRating).toFixed(1)
          : entry.rating,
      poster: detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : entry.poster,
      genres:
        detail.Genre && detail.Genre !== 'N/A'
          ? detail.Genre.split(',').map((g: string) => g.trim()).slice(0, 3)
          : entry.genres,
      synopsis:
        detail.Plot && detail.Plot !== 'N/A'
          ? stripHtml(detail.Plot).slice(0, 140)
          : entry.synopsis,
    };
  } catch {
    return entry;
  }
}

function toShowcaseItem(entry: ImdbChartEntry, index: number): LiveShowcaseItem {
  return {
    title: entry.title,
    year: entry.year,
    rating: entry.rating,
    quality: '4K',
    poster: entry.poster || 'https://image.tmdb.org/t/p/w500/1pdfLPoL6VFi8B8RFiMfaUtM3Zg.jpg',
    genres: entry.genres,
    synopsis: entry.synopsis,
    sourcesCount: Math.max(8, 20 - index),
    category: 'movies',
    imdbId: entry.imdbId || undefined,
  };
}

export async function getDailyImdbTrendingMovies(limit = 12): Promise<LiveShowcaseItem[]> {
  const cacheKey = todayCacheKey();
  const cached = cache.get<LiveShowcaseItem[]>(cacheKey);
  if (cached && cached.length >= 4) return cached;

  let chartEntries = await fetchImdbMoviemeterChart(limit);
  if (chartEntries.length < 4) {
    chartEntries = await fetchTmdbTrendingMovies(limit);
  }

  if (chartEntries.length < 4) return [];

  const enriched = await Promise.all(
    chartEntries.slice(0, limit).map((entry) => enrichFromOmdb(entry))
  );

  const showcase = enriched.map(toShowcaseItem);
  cache.set(cacheKey, showcase, DAY_MS);
  return showcase;
}
