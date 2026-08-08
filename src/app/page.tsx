'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatNumber, DIRECTORY_CATEGORIES, cn } from '@/lib/utils';
import { SearchSuggestionsSlider } from '@/components/search/SearchSuggestionsSlider';
import { WebsiteLogo } from '@/components/WebsiteLogo';
import { buildSearchUrlFromSuggestion } from '@/lib/search-navigation';
import type { ContentCategory } from '@/types';

const DISCORD_URL = 'https://discord.gg/ATGRvAjBr';
const REDDIT_URL = 'https://www.reddit.com/user/allsitehub/';

const MOTION_EASE = [0.16, 1, 0.3, 1] as const;
const SCROLL_REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-48px' as const },
  transition: { duration: 0.55, ease: MOTION_EASE },
};

const SEARCH_PLACEHOLDERS = [
  'Search movies across every indexed site…',
  'Find anime titles in one query…',
  'Look up manga from trusted sources…',
  'Discover live sports streams…',
  'Browse live TV channels…',
];

const TOP_RANK_MOVIES = [
  {
    title: 'Dune: Part Two',
    year: 2024,
    rating: '8.6',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLPoL6VFi8B8RFiMfaUtM3Zg.jpg',
    genres: ['Sci-Fi', 'Adventure'],
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.',
    sourcesCount: 18,
  },
  {
    title: 'Oppenheimer',
    year: 2023,
    rating: '8.9',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGvjW71vKWc.jpg',
    genres: ['Biography', 'Drama'],
    synopsis: 'The story of J. Robert Oppenheimer and his role in developing the atomic bomb.',
    sourcesCount: 16,
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    rating: '9.0',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genres: ['Action', 'Crime'],
    synopsis: 'Batman faces his greatest challenge against the chaotic Joker in Gotham City.',
    sourcesCount: 22,
  },
  {
    title: 'Interstellar',
    year: 2014,
    rating: '8.7',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    genres: ['Sci-Fi', 'Drama'],
    synopsis: 'Explorers travel through a wormhole in space to ensure humanity’s survival.',
    sourcesCount: 19,
  },
  {
    title: 'Deadpool & Wolverine',
    year: 2024,
    rating: '8.0',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    genres: ['Action', 'Comedy'],
    synopsis: 'Deadpool teams up with a reluctant Wolverine on a mission that reshapes the MCU.',
    sourcesCount: 15,
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    rating: '8.7',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sFm8.jpg',
    genres: ['Animation', 'Action'],
    synopsis: 'Miles Morales catapults across the Multiverse and meets other Spider-People.',
    sourcesCount: 14,
  },
  {
    title: 'Severance',
    year: 2022,
    rating: '8.7',
    quality: '4K',
    poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/397/993132.jpg',
    genres: ['Sci-Fi', 'Thriller'],
    synopsis: 'Office workers whose memories are surgically split between work and home.',
    sourcesCount: 12,
  },
  {
    title: 'Gladiator II',
    year: 2024,
    rating: '7.9',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    genres: ['Action', 'Drama'],
    synopsis: 'Lucius returns to the Colosseum after Rome falls under tyrannical rule.',
    sourcesCount: 11,
  },
  {
    title: 'House of the Dragon',
    year: 2024,
    rating: '8.5',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg',
    genres: ['Action', 'Fantasy'],
    synopsis: 'House Targaryen two centuries before Game of Thrones.',
    sourcesCount: 17,
  },
  {
    title: 'Stranger Things',
    year: 2024,
    rating: '8.7',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    genres: ['Sci-Fi', 'Horror'],
    synopsis: 'A small town uncovers secrets, experiments, and supernatural forces.',
    sourcesCount: 21,
  },
  {
    title: 'The Last of Us',
    year: 2023,
    rating: '8.8',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    genres: ['Action', 'Drama'],
    synopsis: 'Joel and Ellie cross a post-apocalyptic America overrun by the infected.',
    sourcesCount: 19,
  },
  {
    title: 'Arcane',
    year: 2024,
    rating: '9.0',
    quality: '4K',
    poster: 'https://image.tmdb.org/t/p/w500/fqld22jKw1abzGlhSolPGwGqZFE.jpg',
    genres: ['Animation', 'Sci-Fi'],
    synopsis: 'Piltover and Zaun collide through the story of two iconic champions.',
    sourcesCount: 16,
  },
];

const TOP_RANK_ANIME = [
  {
    title: 'Frieren: Beyond Journey’s End',
    year: 2023,
    rating: '9.3',
    quality: '4K',
    poster: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    genres: ['Fantasy', 'Adventure'],
    synopsis: 'An elf mage reflects on life after defeating the Demon King.',
    sourcesCount: 14,
  },
  {
    title: 'Attack on Titan',
    year: 2013,
    rating: '9.1',
    quality: '1080p',
    poster: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    genres: ['Action', 'Dark Fantasy'],
    synopsis: 'Eren vows to wipe out the Titans after his hometown is destroyed.',
    sourcesCount: 16,
  },
  {
    title: 'Demon Slayer: Hashira Training',
    year: 2024,
    rating: '8.7',
    quality: '4K',
    poster: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    genres: ['Action', 'Supernatural'],
    synopsis: 'Tanjiro trains with the Hashira ahead of the battle against Muzan.',
    sourcesCount: 15,
  },
  {
    title: 'Solo Leveling',
    year: 2024,
    rating: '8.5',
    quality: '4K',
    poster: 'https://cdn.myanimelist.net/images/anime/1733/141163l.jpg',
    genres: ['Action', 'Fantasy'],
    synopsis: 'The weakest hunter gains a mysterious system that lets him level up.',
    sourcesCount: 13,
  },
  {
    title: 'Jujutsu Kaisen',
    year: 2020,
    rating: '8.6',
    quality: '4K',
    poster: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
    genres: ['Action', 'Supernatural'],
    synopsis: 'A boy swallows a cursed relic and joins the fight against dark spirits.',
    sourcesCount: 14,
  },
  {
    title: 'One Piece',
    year: 1999,
    rating: '8.9',
    quality: '1080p',
    poster: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',
    genres: ['Action', 'Adventure'],
    synopsis: 'Luffy and his crew sail the Grand Line in search of One Piece.',
    sourcesCount: 20,
  },
  {
    title: 'Bleach: Thousand-Year Blood War',
    year: 2022,
    rating: '9.0',
    quality: '4K',
    poster: 'https://cdn.myanimelist.net/images/anime/1764/126627l.jpg',
    genres: ['Action', 'Supernatural'],
    synopsis: 'Ichigo faces a mysterious enemy threatening Soul Society.',
    sourcesCount: 12,
  },
  {
    title: 'Chainsaw Man',
    year: 2022,
    rating: '8.5',
    quality: '4K',
    poster: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    genres: ['Action', 'Horror'],
    synopsis: 'Denji merges with Pochita and becomes Chainsaw Man.',
    sourcesCount: 11,
  },
];

const FAQS = [
  {
    q: 'Where do the site links come from?',
    a: 'Every listing is curated into Movies & TV, Anime, Manga, Sports, or Live TV. MoviesNet indexes configured portals and opens the original source — nothing is mirrored here.',
  },
  {
    q: 'Does MoviesNet host or stream media?',
    a: 'No. MoviesNet is a discovery engine only. It does not host, upload, cache, embed, or stream copyrighted media.',
  },
  {
    q: 'How fresh are the results?',
    a: 'Configured mirrors are health-checked regularly so availability and response signals stay current.',
  },
  {
    q: 'Can I search across categories?',
    a: 'Yes. Start from the hero search or open a category directory, then refine by title, language, and quality on the results page.',
  },
];

interface SiteData {
  id: string;
  name: string;
  slug: string;
  description: string;
  homepageUrl: string;
  logoUrl: string;
  categories: ContentCategory[];
  languages: string[];
  tags?: string[];
  totalIndexed?: number;
  popularity?: number;
  priority?: number;
}

function useTypingAnimation(phrases: string[], typingSpeed = 42, deletingSpeed = 22, pauseDuration = 2400) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1));
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, phraseIndex, isDeleting, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return displayText;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ContentCategory>('movies');
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [showcaseTab, setShowcaseTab] = useState<'movies' | 'anime'>('movies');
  const [websites, setWebsites] = useState<SiteData[]>([]);
  const [liveMovies, setLiveMovies] = useState(TOP_RANK_MOVIES);
  const [liveAnime, setLiveAnime] = useState(TOP_RANK_ANIME);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [heroSuggestions, setHeroSuggestions] = useState<
    { title: string; year: number | null; category: string; poster: string | null }[]
  >([]);
  const [showHeroSuggestions, setShowHeroSuggestions] = useState(false);

  const showcaseScrollRef = useRef<HTMLDivElement>(null);
  const typingText = useTypingAnimation(SEARCH_PLACEHOLDERS);

  const scrollShowcase = (direction: 'left' | 'right') => {
    showcaseScrollRef.current?.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    showcaseScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [showcaseTab]);

  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch('/api/websites');
        if (res.ok) setWebsites(await res.json());
      } catch (err) {
        console.error('Failed to load websites:', err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchLiveTrending() {
      try {
        const res = await fetch('/api/trending/live');
        if (res.ok) {
          const data = await res.json();
          if (data.movies?.length) setLiveMovies(data.movies);
          if (data.anime?.length) setLiveAnime(data.anime);
        }
      } catch (err) {
        console.warn('Live media fetch fallback:', err);
      }
    }

    fetchSites();
    fetchLiveTrending();
  }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  const filteredWebsites = useMemo(() => {
    return websites.filter((site) => {
      const categoryMatch = site.categories.includes(activeCategory);
      if (!categoryMatch) return false;
      if (!siteSearchQuery.trim()) return true;

      const q = siteSearchQuery.toLowerCase().trim();
      return (
        site.name.toLowerCase().includes(q) ||
        site.homepageUrl.toLowerCase().includes(q) ||
        site.description.toLowerCase().includes(q)
      );
    });
  }, [websites, activeCategory, siteSearchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DIRECTORY_CATEGORIES.forEach((cat) => {
      counts[cat.id] = websites.filter((w) => w.categories.includes(cat.slug)).length;
    });
    return counts;
  }, [websites]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setHeroSuggestions([]);
      setShowHeroSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const list = data.suggestions || [];
          setHeroSuggestions(list);
          if (list.length > 0) setShowHeroSuggestions(true);
        }
      } catch {
        setHeroSuggestions([]);
        setShowHeroSuggestions(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.hero-search-wrapper')) setShowHeroSuggestions(false);
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const totalSitesCount = websites.length || 109;
  const activeCategoryLabel =
    DIRECTORY_CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Streaming';
  const showcaseItems = showcaseTab === 'movies' ? liveMovies : liveAnime;
  const hasHeroSuggestions = showHeroSuggestions && heroSuggestions.length > 0;

  return (
    <div className="relative min-h-screen bg-transparent text-[#f4f1ea] overflow-x-hidden">
      {/* HERO + search (suggestions expand inline and push trending down) */}
      <section
        className={cn(
          'home-hero-section relative flex flex-col page-gutter',
          hasHeroSuggestions
            ? 'min-h-0 py-10 sm:py-12 justify-start'
            : 'min-h-[calc(100svh-var(--header-height))] justify-center pb-12 sm:pb-16 pt-6 sm:pt-12'
        )}
      >
        <div className="max-w-6xl mx-auto w-full text-center">
          <div>
            <h1 className="home-fade-up lg:hidden home-hero-tagline font-display text-2xl font-bold tracking-tight text-white/95 mb-3 px-1">
              Search once. Find everywhere.
            </h1>

            <h1 className="home-fade-up hidden lg:block font-display font-extrabold home-hero-brand mb-4 sm:mb-6 select-none mx-auto">
              <span className="brand-solid">Movies</span>
              <span className="brand-accent">Net</span>
            </h1>

            <p className="home-fade-up-delay home-hero-tagline hidden lg:block font-display text-xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white/95 mb-4 sm:mb-5 px-1">
              Search once. Find everywhere.
            </p>

            <p className="home-fade-up-delay-2 text-sm sm:text-lg text-white/55 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-1">
              <span className="lg:hidden">One search across movies, anime, manga, sports, and live TV.</span>
              <span className="hidden lg:inline">One query across curated movies, anime, manga, sports, and live TV — then open the original source.</span>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              setShowHeroSuggestions(false);
              setHeroSuggestions([]);
              handleSearchSubmit(e);
            }}
            className="home-fade-up-delay-2 max-w-3xl mx-auto hero-search-wrapper"
          >
            <div className="home-search-shell home-search-shell-mobile rounded-2xl p-2 sm:p-2">
              <div className="home-search-row flex items-center gap-2 min-w-0 flex-1">
                <div className="pl-1 sm:pl-3 text-white/45 shrink-0" aria-hidden>
                  <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setShowHeroSuggestions(val.trim().length >= 2);
                  }}
                  placeholder={typingText || 'Search titles…'}
                  suppressHydrationWarning
                  className="w-full min-w-0 bg-transparent text-white font-medium text-base sm:text-base py-2.5 sm:py-3 outline-none placeholder:text-white/35"
                  aria-label="Search content across all websites"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className="home-search-submit shrink-0 w-full lg:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#e8b86d] text-[#1a1208] font-display font-bold text-sm tracking-wide hover:bg-[#f0c987] transition-colors active:scale-[0.98]"
              >
                Search
              </button>
            </div>

            <AnimatePresence initial={false}>
              {hasHeroSuggestions && (
                <SearchSuggestionsSlider
                  suggestions={heroSuggestions}
                  variant="home"
                  layout="inline"
                onSelect={(item) => {
                  setSearchQuery(item.title);
                  setShowHeroSuggestions(false);
                  setHeroSuggestions([]);
                  router.push(buildSearchUrlFromSuggestion(item));
                }}
                />
              )}
            </AnimatePresence>
          </form>

          <div className="home-fade-up-delay-2 mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-1">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-community-toggle home-community-toggle-discord"
            >
              <span className="home-community-toggle-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.894a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </span>
              <span className="home-community-toggle-label">Discord</span>
            </a>
            <a
              href={REDDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-community-toggle home-community-toggle-reddit"
            >
              <span className="home-community-toggle-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547l-.8 3.747c1.824.07 3.48.632 4.674 1.488c.308-.309.73-.491 1.196-.491c.962 0 1.743.78 1.743 1.742c0 .601-.307 1.127-.77 1.43c.018.188.028.38.028.574c0 2.907-3.37 5.263-7.525 5.263c-4.156 0-7.526-2.356-7.526-5.263c0-.184.009-.368.025-.544A1.737 1.737 0 0 1 3.5 12.18c0-.962.78-1.742 1.742-1.742c.465 0 .888.182 1.196.49c1.192-.855 2.846-1.417 4.67-1.488l.942-4.411a.25.25 0 0 1 .288-.194l3.14.661c.143-.448.56-.752 1.032-.752zM9.354 13.991c-.68 0-1.232.552-1.232 1.232c0 .68.552 1.232 1.232 1.232c.68 0 1.232-.552 1.232-1.232c0-.68-.552-1.232-1.232-1.232zm5.292 0c-.68 0-1.232.552-1.232 1.232c0 .68.552 1.232 1.232 1.232c.68 0 1.232-.552 1.232-1.232c0-.68-.552-1.232-1.232-1.232zm-5.048 3.63a.25.25 0 0 0-.173.43c.87.87 2.4.95 2.576.95c.175 0 1.706-.08 2.576-.95a.25.25 0 0 0-.353-.353c-.636.635-1.82.723-2.223.723c-.402 0-1.587-.088-2.223-.723a.247.247 0 0 0-.18-.077z" />
                </svg>
              </span>
              <span className="home-community-toggle-label">Reddit</span>
            </a>
          </div>

          {!hasHeroSuggestions && (
            <div className="home-fade-up-delay-2 mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm px-1">
              <a
                href="#trending"
                className="text-white/55 hover:text-[#e8b86d] transition-colors underline-offset-4 hover:underline"
              >
                See what’s trending
              </a>
              <span className="text-white/20" aria-hidden>
                ·
              </span>
              <a
                href="#directory"
                className="text-white/55 hover:text-[#e8b86d] transition-colors underline-offset-4 hover:underline"
              >
                Browse directory
              </a>
            </div>
          )}
        </div>
      </section>

      <div className="home-content-below page-shell mx-auto page-gutter space-y-16 sm:space-y-24 pb-20 sm:pb-28 pt-4 sm:pt-6">
        {/* TRENDING */}
        <motion.section id="trending" className="scroll-mt-28 home-section-reveal" {...SCROLL_REVEAL}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Trending now
              </h2>
              <p className="mt-3 text-base text-white/50 max-w-xl">
                Popular titles people are searching — pick one to find sources instantly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="segment-toggle">
                {(['movies', 'anime'] as const).map((tab) => {
                  const isActive = showcaseTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setShowcaseTab(tab)}
                      className={cn(
                        'segment-toggle-btn px-4 py-2 text-sm capitalize',
                        isActive ? 'text-[#1a1208]' : 'text-white/55 hover:text-white'
                      )}
                      aria-pressed={isActive}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="home-showcase-pill"
                          className="segment-toggle-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative z-10">
                        {tab === 'movies' ? 'Movies & shows' : 'Anime'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="hidden sm:flex gap-1">
                <button
                  type="button"
                  onClick={() => scrollShowcase('left')}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                  aria-label="Scroll left"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollShowcase('right')}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                  aria-label="Scroll right"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showcaseTab}
              ref={showcaseScrollRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: MOTION_EASE }}
              className="home-rail-scroll flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
            >
              {showcaseItems.map((item, idx) => (
                <article
                  key={item.title}
                  className="home-rail-item group relative min-w-[180px] w-[180px] sm:min-w-[220px] sm:w-[220px] shrink-0 snap-start rounded-2xl overflow-hidden border border-white/10 bg-[#0a0d14]/70"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          showcaseTab === 'movies'
                            ? 'https://image.tmdb.org/t/p/w500/1pdfLPoL6VFi8B8RFiMfaUtM3Zg.jpg'
                            : 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#03050a] via-transparent to-transparent opacity-90" />
                    <div className="absolute top-3 left-3 font-display text-xs font-bold text-[#e8b86d]">
                      #{idx + 1}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-[11px] text-white/70 mb-1">
                        <span>{item.year}</span>
                        <span className="text-white/30">·</span>
                        <span>{item.rating}</span>
                      </div>
                      <h3 className="font-display text-sm font-semibold text-white leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(item.title)}`}
                    className="block text-center py-3 text-xs font-semibold tracking-wide text-white/70 hover:text-[#e8b86d] border-t border-white/10 transition-colors"
                  >
                    Find sources
                  </Link>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* DIRECTORY */}
        <motion.section
          id="directory"
          className="scroll-mt-28 home-section-reveal"
          {...SCROLL_REVEAL}
          transition={{ ...SCROLL_REVEAL.transition, delay: 0.05 }}
        >
          <div className="mb-6 sm:mb-10">
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Site directory
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/50 max-w-xl">
              {totalSitesCount} curated portals. Filter by category, then visit or search inside a site.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="websites-filter-rail overflow-x-auto no-scrollbar">
              <div className="segment-toggle w-max min-w-full">
              {DIRECTORY_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.slug)}
                    className={cn(
                      'segment-toggle-btn px-3.5 py-2 text-sm whitespace-nowrap',
                      isActive ? 'text-[#1a1208]' : 'text-white/55 hover:text-white'
                    )}
                    aria-pressed={isActive}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="home-directory-pill"
                        className="segment-toggle-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">
                      {cat.label}
                      <span className={cn('ml-1.5 text-[11px]', isActive ? 'text-[#1a1208]/70' : 'text-white/35')}>
                        {categoryCounts[cat.id] || 0}
                      </span>
                    </span>
                  </button>
                );
              })}
              </div>
            </div>

            <div className="relative w-full lg:max-w-sm lg:ml-auto">
              <input
                type="text"
                value={siteSearchQuery}
                onChange={(e) => setSiteSearchQuery(e.target.value)}
                placeholder={`Filter ${activeCategoryLabel.toLowerCase()} sites…`}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#e8b86d]/50 transition-colors"
              />
              {siteSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSiteSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-sm"
                  aria-label="Clear filter"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="home-directory-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-white/[0.03] border border-white/8 animate-pulse" />
              ))}
            </div>
          ) : filteredWebsites.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-sm text-white/50 mb-4">No sites match this filter.</p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('movies');
                  setSiteSearchQuery('');
                }}
                className="text-sm font-semibold text-[#e8b86d] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: MOTION_EASE }}
              className="home-directory-grid"
            >
              {filteredWebsites.map((site) => (
                <a
                  key={site.id}
                  href={site.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-directory-card directory-card-link group flex flex-col rounded-2xl border border-white/10 bg-[#0a0d14]/55 hover:border-[#e8b86d]/30 active:scale-[0.99] transition-[transform,border-color,background-color] duration-200 p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3 mb-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      <WebsiteLogo
                        homepageUrl={site.homepageUrl}
                        logoUrl={site.logoUrl}
                        name={site.name}
                        size={64}
                        imgClassName="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm sm:text-base font-semibold text-white group-hover:text-[#e8b86d] transition-colors truncate">
                        {site.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-white/40 truncate mt-0.5 font-mono">
                        {site.homepageUrl.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0 text-white/25 group-hover:text-[#e8b86d]/70 transition-colors mt-0.5"
                      aria-hidden
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>

                  <p className="text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-2 flex-1">
                    {site.description || 'Curated portal ready for multi-source discovery.'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-white/40 mt-3 pt-3 border-t border-white/8">
                    <span>{formatNumber(site.totalIndexed || 0)} indexed</span>
                    <span className="text-emerald-400/90">Online</span>
                  </div>
                </a>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* FAQ */}
        <motion.section
          id="faq"
          className="scroll-mt-28 max-w-4xl home-section-reveal"
          {...SCROLL_REVEAL}
          transition={{ ...SCROLL_REVEAL.transition, delay: 0.08 }}
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Questions
          </h2>
          <p className="text-base text-white/50 mb-10">
            Clear answers about how MoviesNet works and what it does not do.
          </p>

          <div className="space-y-2">
            {FAQS.map((faq, i) => {
              const open = expandedFaq === i;
              return (
                <div key={faq.q} className="border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(open ? null : i)}
                    className="w-full text-left py-4 flex items-start justify-between gap-4 group"
                    aria-expanded={open}
                  >
                    <span className="font-display text-base sm:text-lg font-semibold text-white group-hover:text-[#e8b86d] transition-colors">
                      {faq.q}
                    </span>
                    <span className="text-[#e8b86d] text-xl leading-none mt-0.5 shrink-0" aria-hidden>
                      {open ? '−' : '+'}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm text-white/55 leading-relaxed pr-8">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
