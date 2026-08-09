// ============================================================================
// AllSiteHub Search — Utility Functions
// ============================================================================
import { type ClassValue, clsx } from 'clsx';
import type { ContentCategory } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Spell correction - simple Levenshtein distance
export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Find closest match for spell correction
export function findClosestMatch(query: string, dictionary: string[]): string | null {
  if (!query || dictionary.length === 0) return null;

  let bestMatch = '';
  let bestDistance = Infinity;

  for (const word of dictionary) {
    const distance = levenshtein(query.toLowerCase(), word.toLowerCase());
    if (distance < bestDistance && distance <= 2) {
      bestDistance = distance;
      bestMatch = word;
    }
  }

  return bestDistance <= 2 && bestMatch !== query.toLowerCase() ? bestMatch : null;
}

// Poster maps for exact media resolution
export const MOVIE_POSTERS: Record<string, string> = {
  dune: 'https://image.tmdb.org/t/p/w500/1pdfLPoL6VFi8B8RFiMfaUtM3Zg.jpg',
  oppenheimer: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGvF8Z1nVC4.jpg',
  avengers: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9vKoWRwDqq.jpg',
  interstellar: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  inception: 'https://image.tmdb.org/t/p/w500/oYuLEydvwz1zzUhAcme09t2uL4e.jpg',
  batman: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  spiderman: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sFm8.jpg',
  'spider-man': 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sFm8.jpg',
  joker: 'https://image.tmdb.org/t/p/w500/udDclSub2W1-G-l-3h.jpg',
  deadpool: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  naruto: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
  'one piece': 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
  'dragon ball': 'https://cdn.myanimelist.net/images/anime/10/47339.jpg',
  'demon slayer': 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
  'jujutsu kaisen': 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
  'attack on titan': 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
  frieren: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
  'solo leveling': 'https://cdn.myanimelist.net/images/anime/1733/141163l.jpg',
};

export const CATEGORY_FALLBACK_POSTERS: Record<string, string[]> = {
  movies: [
    'https://image.tmdb.org/t/p/w500/1pdfLPoL6VFi8B8RFiMfaUtM3Zg.jpg',
    'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGvF8Z1nVC4.jpg',
    'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9vKoWRwDqq.jpg',
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  ],
  anime: [
    'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
  ],
  manga: [
    'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
  ],
  sports: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80',
  ],
  'live-tv': [
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80',
  ],
};

export function resolveMoviePoster(itemTitle: string, category: string, index: number = 0): string {
  const t = (itemTitle || '').toLowerCase().trim();
  for (const [key, poster] of Object.entries(MOVIE_POSTERS)) {
    if (t.includes(key) || key.includes(t)) {
      return poster;
    }
  }

  const list = CATEGORY_FALLBACK_POSTERS[category] || CATEGORY_FALLBACK_POSTERS.movies;
  return list[Math.abs(index) % list.length];
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format relative time
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Category display info
export const CATEGORIES = [
  { slug: 'movies' as const, name: 'Movies', icon: '🎬', gradient: 'from-blue-500 to-indigo-600', description: 'Feature films, blockbusters, and cinema releases' },
  { slug: 'tv-shows' as const, name: 'TV Shows', icon: '📺', gradient: 'from-indigo-500 to-violet-600', description: 'Series, seasons, and episodic television' },
  { slug: 'anime' as const, name: 'Anime', icon: '⛩️', gradient: 'from-pink-500 to-purple-600', description: 'Japanese animation series, movies, and subs/dubs' },
  { slug: 'manga' as const, name: 'Manga', icon: '📚', gradient: 'from-amber-500 to-orange-600', description: 'Manga readers, comic chapters, and digital webtoons' },
  { slug: 'sports' as const, name: 'Sports', icon: '⚽', gradient: 'from-emerald-500 to-teal-500', description: 'Live sports matches, leagues, and streams' },
  { slug: 'live-tv' as const, name: 'Live TV', icon: '📡', gradient: 'from-cyan-500 to-blue-600', description: 'Live IPTV broadcasting and continuous television streams' },
] as const;

export type DirectoryCategoryId = 'movies-tv' | 'anime' | 'manga' | 'sports' | 'live-tv';

export const DIRECTORY_CATEGORIES: {
  id: DirectoryCategoryId;
  label: string;
  slug: DirectoryCategoryId;
  matchSlugs: ContentCategory[];
}[] = [
  { id: 'movies-tv', label: 'Movies & TV', slug: 'movies-tv', matchSlugs: ['movies', 'tv-shows'] },
  { id: 'anime', label: 'Anime', slug: 'anime', matchSlugs: ['anime'] },
  { id: 'manga', label: 'Manga', slug: 'manga', matchSlugs: ['manga'] },
  { id: 'sports', label: 'Sports', slug: 'sports', matchSlugs: ['sports'] },
  { id: 'live-tv', label: 'Live TV', slug: 'live-tv', matchSlugs: ['live-tv'] },
];

export function siteMatchesDirectoryCategory(
  categories: ContentCategory[],
  directoryId: DirectoryCategoryId
): boolean {
  const def = DIRECTORY_CATEGORIES.find((c) => c.id === directoryId);
  if (!def) return false;
  return def.matchSlugs.some((slug) => categories.includes(slug));
}

export function countSitesInDirectoryCategory(
  websites: { categories: ContentCategory[] }[],
  directoryId: DirectoryCategoryId
): number {
  return websites.filter((w) => siteMatchesDirectoryCategory(w.categories, directoryId)).length;
}

// Quality badge colors
export const QUALITY_COLORS: Record<string, string> = {
  '4k': 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black',
  '2k': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  '1080p': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  '720p': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
  '480p': 'bg-gray-600 text-gray-200',
};

// Status badge colors
export const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ongoing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  movie: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  series: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};
