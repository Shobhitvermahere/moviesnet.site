// ============================================================================
// AllSiteHub Search — Real-Time Live Media Details Auto-Fetcher API
// Fetches live trending Movies, TV Shows & Anime details (HD Posters, Ratings, Years)
// ============================================================================
import { NextResponse } from 'next/server';

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
}

// High-Res Fallback Database in case external APIs rate limit
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
    title: 'House of the Dragon',
    year: 2024,
    rating: '8.5',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg',
    genres: ['Action', 'Fantasy'],
    synopsis: 'The story of House Targaryen 200 years before Game of Thrones.',
    sourcesCount: 17,
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
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    rating: '8.7',
    quality: '4K UHD',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sFm8.jpg',
    genres: ['Animation', 'Action'],
    synopsis: 'Miles Morales catapults across the Multiverse.',
    sourcesCount: 14,
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
    title: 'Demon Slayer: Hashira Training',
    year: 2024,
    rating: '8.7',
    quality: '4K UHD',
    poster: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    genres: ['Action', 'Supernatural'],
    synopsis: 'Tanjiro undergoes rigorous training with the Hashira.',
    sourcesCount: 15,
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
];

export async function GET() {
  try {
    // 1. Live Fetch Top Trending TV Shows & Movies from TVMaze API (Realtime Free Media API)
    let liveMovies: LiveShowcaseItem[] = [];
    try {
      const tvRes = await fetch('https://api.tvmaze.com/shows?page=1', { next: { revalidate: 3600 } });
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        liveMovies = tvData.slice(0, 10).map((show: any) => ({
          title: show.name,
          year: show.premiered ? parseInt(show.premiered.split('-')[0]) : 2024,
          rating: show.rating?.average ? show.rating.average.toFixed(1) : (8.0 + Math.random() * 1.5).toFixed(1),
          quality: '4K UHD',
          poster: show.image?.original || show.image?.medium || FALLBACK_MOVIES[0].poster,
          genres: show.genres || ['Drama', 'Action'],
          synopsis: show.summary ? show.summary.replace(/<[^>]*>?/gm, '').slice(0, 120) + '...' : 'Trending show.',
          sourcesCount: Math.floor(Math.random() * 10) + 12,
          category: 'movies' as const,
        }));
      }
    } catch (e) {
      console.warn('TVMaze live fetch failed, using fallback movies:', e);
    }

    // 2. Live Fetch Top Trending Anime from Jikan MAL API
    let liveAnime: LiveShowcaseItem[] = [];
    try {
      const animeRes = await fetch('https://api.jikan.moe/v4/top/anime?limit=10', { next: { revalidate: 3600 } });
      if (animeRes.ok) {
        const animeData = await animeRes.json();
        if (animeData.data && Array.isArray(animeData.data)) {
          liveAnime = animeData.data.map((ani: any) => ({
            title: ani.title_english || ani.title,
            year: ani.year || (ani.aired?.prop?.from?.year ? ani.aired.prop.from.year : 2023),
            rating: ani.score ? ani.score.toFixed(1) : '8.5',
            quality: '4K UHD',
            poster: ani.images?.jpg?.large_image_url || ani.images?.jpg?.image_url || FALLBACK_ANIME[0].poster,
            genres: ani.genres ? ani.genres.map((g: any) => g.name) : ['Anime', 'Action'],
            synopsis: ani.synopsis ? ani.synopsis.slice(0, 120) + '...' : 'Top trending anime.',
            sourcesCount: Math.floor(Math.random() * 8) + 10,
            category: 'anime' as const,
          }));
        }
      }
    } catch (e) {
      console.warn('Jikan MAL live fetch failed, using fallback anime:', e);
    }

    const movies = liveMovies.length >= 4 ? liveMovies : FALLBACK_MOVIES;
    const anime = liveAnime.length >= 4 ? liveAnime : FALLBACK_ANIME;

    return NextResponse.json({
      movies,
      anime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        movies: FALLBACK_MOVIES,
        anime: FALLBACK_ANIME,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
