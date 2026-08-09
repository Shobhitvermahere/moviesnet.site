import type { Website } from '@/types';
import { getDailyImdbTrendingMovies } from './imdb-trending';
import { resolveWebsiteLogoUrl } from './website-logo';
import { isValidPosterUrl, pickItemsWithVerifiedPosters } from './poster-utils';

export interface LiveShowcaseItem {
  title: string;
  year: number;
  rating: string;
  quality: string;
  poster: string;
  genres: string[];
  synopsis: string;
  sourcesCount: number;
  category: 'movies' | 'anime';
  imdbId?: string;
}

export interface DirectoryTrendingPick extends LiveShowcaseItem {
  featuredSites: { id: string; name: string; logoUrl: string; homepageUrl: string }[];
}

const FALLBACK_MOVIES: LiveShowcaseItem[] = [
  {
    title: 'Dune: Part Two',
    year: 2024,
    rating: '8.6',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLPoL6VFi8B8RFiMfaUtM3Zg.jpg',
    genres: ['Sci-Fi', 'Adventure'],
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
    sourcesCount: 18,
    category: 'movies',
  },
  {
    title: 'Deadpool & Wolverine',
    year: 2024,
    rating: '8.0',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    genres: ['Action', 'Comedy'],
    synopsis: 'Deadpool teams up with Wolverine on a multiverse mission.',
    sourcesCount: 15,
    category: 'movies',
  },
  {
    title: 'Oppenheimer',
    year: 2023,
    rating: '8.9',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGvjW71vKWc.jpg',
    genres: ['Biography', 'Drama'],
    synopsis: 'The story of J. Robert Oppenheimer and the atomic bomb.',
    sourcesCount: 16,
    category: 'movies',
  },
  {
    title: 'The Last of Us',
    year: 2023,
    rating: '8.8',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    genres: ['Action', 'Drama'],
    synopsis: 'Joel and Ellie travel across a post-apocalyptic United States.',
    sourcesCount: 19,
    category: 'movies',
  },
  {
    title: 'Stranger Things',
    year: 2024,
    rating: '8.7',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    genres: ['Sci-Fi', 'Horror'],
    synopsis: 'Supernatural forces and secret experiments in a small town.',
    sourcesCount: 21,
    category: 'movies',
  },
  {
    title: 'Arcane',
    year: 2024,
    rating: '9.0',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/fqld22jKw1abzGlhSolPGwGqZFE.jpg',
    genres: ['Animation', 'Sci-Fi'],
    synopsis: 'Set in Piltover and Zaun, the origin of two iconic champions.',
    sourcesCount: 16,
    category: 'movies',
  },
];

const FALLBACK_ANIME: LiveShowcaseItem[] = [
  {
    title: 'Frieren: Beyond Journey’s End',
    year: 2023,
    rating: '9.3',
    quality: '4K UHD',
    poster: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    genres: ['Fantasy', 'Adventure'],
    synopsis: 'An elf mage embarks on a new reflective journey.',
    sourcesCount: 14,
    category: 'anime',
  },
  {
    title: 'Solo Leveling',
    year: 2024,
    rating: '8.5',
    quality: '4K UHD',
    poster: 'https://cdn.myanimelist.net/images/anime/1733/141163l.jpg',
    genres: ['Action', 'Fantasy'],
    synopsis: 'Sung Jinwoo obtains a quest window allowing him to level up.',
    sourcesCount: 13,
    category: 'anime',
  },
  {
    title: 'Jujutsu Kaisen',
    year: 2020,
    rating: '8.6',
    quality: '4K UHD',
    poster: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
    genres: ['Action', 'Supernatural'],
    synopsis: 'A boy swallows a cursed finger to fight dark spirits.',
    sourcesCount: 14,
    category: 'anime',
  },
  {
    title: 'Attack on Titan',
    year: 2013,
    rating: '9.1',
    quality: '1080P',
    poster: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    genres: ['Action', 'Dark Fantasy'],
    synopsis: 'Eren Jaeger vows to cleanse the earth of giant Titans.',
    sourcesCount: 16,
    category: 'anime',
  },
  {
    title: 'One Piece',
    year: 1999,
    rating: '8.9',
    quality: '1080P',
    poster: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',
    genres: ['Action', 'Adventure'],
    synopsis: 'Luffy and his pirate crew explore the Grand Line for the One Piece.',
    sourcesCount: 20,
    category: 'anime',
  },
  {
    title: 'Demon Slayer',
    year: 2024,
    rating: '8.7',
    quality: '4K UHD',
    poster: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    genres: ['Action', 'Supernatural'],
    synopsis: 'Tanjiro fights demons to save his sister.',
    sourcesCount: 15,
    category: 'anime',
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function websitesForCategory(websites: Website[], category: LiveShowcaseItem['category']): Website[] {
  if (category === 'anime') {
    const animeSites = websites.filter((w) => w.categories.includes('anime'));
    return animeSites.length > 0 ? animeSites : websites;
  }
  const mediaSites = websites.filter(
    (w) => w.categories.includes('movies') || w.categories.includes('tv-shows')
  );
  return mediaSites.length > 0 ? mediaSites : websites;
}

function pickFeaturedSites(websites: Website[], category: LiveShowcaseItem['category'], count = 3) {
  const pool = shuffle(websitesForCategory(websites, category));
  return pool.slice(0, count).map((site) => ({
    id: site.id,
    name: site.name,
    logoUrl: resolveWebsiteLogoUrl(site.homepageUrl, site.logoUrl),
    homepageUrl: site.homepageUrl,
  }));
}

export async function fetchLiveShowcase(): Promise<{ movies: LiveShowcaseItem[]; anime: LiveShowcaseItem[] }> {
  let liveMovies: LiveShowcaseItem[] = [];
  try {
    liveMovies = await getDailyImdbTrendingMovies(12);
  } catch {
    // fall through to fallback
  }

  let liveAnime: LiveShowcaseItem[] = [];
  try {
    const animeRes = await fetch('https://api.jikan.moe/v4/top/anime?limit=25', {
      next: { revalidate: 14400 },
    });
    if (animeRes.ok) {
      const animeData = await animeRes.json();
      if (animeData.data && Array.isArray(animeData.data)) {
        const mapped: LiveShowcaseItem[] = animeData.data
          .map((ani: {
            title_english?: string;
            title: string;
            year?: number;
            aired?: { prop?: { from?: { year?: number } } };
            score?: number;
            images?: { jpg?: { large_image_url?: string; image_url?: string } };
            genres?: { name: string }[];
            synopsis?: string;
          }) => {
            const poster = ani.images?.jpg?.large_image_url || ani.images?.jpg?.image_url || '';
            if (!isValidPosterUrl(poster)) return null;

            return {
              title: ani.title_english || ani.title,
              year: ani.year || ani.aired?.prop?.from?.year || 2023,
              rating: ani.score ? ani.score.toFixed(1) : '8.5',
              quality: '4K UHD',
              poster,
              genres: ani.genres ? ani.genres.map((g) => g.name) : ['Anime', 'Action'],
              synopsis: ani.synopsis ? ani.synopsis.slice(0, 120) + '...' : 'Top trending anime.',
              sourcesCount: Math.floor(Math.random() * 8) + 10,
              category: 'anime' as const,
            };
          })
          .filter((item: LiveShowcaseItem | null): item is LiveShowcaseItem => item !== null);

        liveAnime = await pickItemsWithVerifiedPosters(mapped, 12, 25);
      }
    }
  } catch {
    // fall through to fallback
  }

  const verifiedMovies = liveMovies.filter((item) => isValidPosterUrl(item.poster));
  const verifiedAnime = liveAnime.filter((item) => isValidPosterUrl(item.poster));

  return {
    movies: verifiedMovies.length >= 4 ? verifiedMovies : FALLBACK_MOVIES,
    anime: verifiedAnime.length >= 4 ? verifiedAnime : FALLBACK_ANIME,
  };
}

export function buildDirectoryTrendingPicks(
  websites: Website[],
  items: LiveShowcaseItem[],
  limit = 12
): DirectoryTrendingPick[] {
  const sortedWebsites = [...websites].sort((a, b) => a.priority - b.priority);
  return shuffle(items)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      featuredSites: pickFeaturedSites(sortedWebsites, item.category, 3),
    }));
}
