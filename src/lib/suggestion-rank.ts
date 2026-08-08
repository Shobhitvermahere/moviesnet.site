export interface SearchSuggestionItem {
  title: string;
  year: number | null;
  category: string;
  poster: string | null;
  imdbId?: string;
  trending?: boolean;
}

const TRENDING_SEED: Omit<SearchSuggestionItem, 'imdbId'>[] = [
  { title: 'Dune: Part Two', year: 2024, category: 'Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLPoL6VFi8B8RFiMfaUtM3Zg.jpg', trending: true },
  { title: 'Deadpool & Wolverine', year: 2024, category: 'Movie', poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', trending: true },
  { title: 'Solo Leveling', year: 2024, category: 'Anime', poster: 'https://cdn.myanimelist.net/images/anime/1733/141163l.jpg', trending: true },
  { title: 'Oppenheimer', year: 2023, category: 'Movie', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGvjW71vKWc.jpg', trending: true },
  { title: 'Jujutsu Kaisen', year: 2020, category: 'Anime', poster: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg', trending: true },
  { title: 'The Last of Us', year: 2023, category: 'TV Series', poster: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', trending: true },
  { title: 'Arcane', year: 2024, category: 'TV Series', poster: 'https://image.tmdb.org/t/p/w500/fqld22jKw1abzGlhSolPGwGqZFE.jpg', trending: true },
  { title: "Frieren: Beyond Journey's End", year: 2023, category: 'Anime', poster: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', trending: true },
  { title: 'Interstellar', year: 2014, category: 'Movie', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', trending: true },
  { title: 'Attack on Titan', year: 2013, category: 'Anime', poster: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg', trending: true },
];

function matchesQuery(title: string, query: string): boolean {
  const t = title.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return false;
  return t.includes(q) || q.split(/\s+/).every((word) => word.length > 0 && t.includes(word));
}

function suggestionScore(item: SearchSuggestionItem, query: string): number {
  const q = query.toLowerCase().trim();
  const title = item.title.toLowerCase();
  let score = 0;

  if (item.trending) score += 200;
  if (title.startsWith(q)) score += 120;
  else if (title.split(/\s+/).some((w) => w.startsWith(q))) score += 80;
  else if (title.includes(q)) score += 50;

  if (item.year) {
    score += Math.min(item.year - 1990, 40);
    if (item.year >= 2024) score += 25;
    else if (item.year >= 2022) score += 12;
  }

  return score;
}

function dedupeKey(item: SearchSuggestionItem): string {
  return item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function rankAndMergeSuggestions(
  query: string,
  remote: SearchSuggestionItem[],
  extraTrending: string[] = []
): SearchSuggestionItem[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const merged = new Map<string, SearchSuggestionItem>();

  for (const seed of TRENDING_SEED) {
    if (matchesQuery(seed.title, q)) {
      merged.set(dedupeKey(seed), { ...seed, trending: true });
    }
  }

  for (const term of extraTrending) {
    if (matchesQuery(term, q)) {
      const key = dedupeKey({ title: term, year: null, category: 'Trending', poster: null });
      if (!merged.has(key)) {
        merged.set(key, {
          title: term,
          year: null,
          category: 'Trending',
          poster: null,
          trending: true,
        });
      }
    }
  }

  for (const item of remote) {
    const key = dedupeKey(item);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        ...item,
        poster: item.poster || existing.poster,
        imdbId: item.imdbId || existing.imdbId,
        trending: existing.trending || item.trending,
      });
    } else {
      merged.set(key, item);
    }
  }

  return Array.from(merged.values())
    .filter((item) => matchesQuery(item.title, q))
    .sort((a, b) => suggestionScore(b, q) - suggestionScore(a, q))
    .slice(0, 12);
}
