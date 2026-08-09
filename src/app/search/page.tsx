'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchStore } from '@/stores';
import { cn, CATEGORIES } from '@/lib/utils';
import { WebsiteLogo } from '@/components/WebsiteLogo';
import { SearchSuggestionsSlider } from '@/components/search/SearchSuggestionsSlider';
import { SearchHeroResult, SiteHandoffModal, useSiteHandoff } from '@/components/search/SearchResultsUI';
import { SearchTrendingPicks } from '@/components/search/SearchTrendingPicks';
import { buildSearchUrlFromSuggestion } from '@/lib/search-navigation';
import type { SearchResponse, SearchFilters, SearchResult, ContentCategory, Language, Quality, ContentStatus, SortOption, Website } from '@/types';

// --- Filter Options ---
const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'dual-audio', label: 'Dual Audio' },
  { value: 'multi-audio', label: 'Multi Audio' },
];

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: '4k', label: '4K Ultra HD' },
  { value: '2k', label: '2K Quad HD' },
  { value: '1080p', label: '1080P Full HD' },
  { value: '720p', label: '720P HD' },
  { value: '480p', label: '480P' },
];

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'movie', label: 'Movie' },
  { value: 'series', label: 'Series' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'fastest', label: 'Fastest Site' },
  { value: 'latest', label: 'Latest' },
  { value: 'highest-quality', label: 'Highest Quality' },
  { value: 'most-sources', label: 'Most Sources' },
];

const SEARCH_DEBOUNCE_MS = 280;

function dismissMobileKeyboard() {
  if (typeof document === 'undefined') return;
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}

// --- Fetch search results ---
async function fetchSearch(
  query: string,
  filters: SearchFilters,
  page: number,
  signal?: AbortSignal
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (filters.category) params.set('category', filters.category);
  if (filters.language) params.set('language', filters.language);
  if (filters.quality) params.set('quality', filters.quality);
  if (filters.status) params.set('status', filters.status);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.website) params.set('website', filters.website);
  if (filters.imdbId) params.set('imdbId', filters.imdbId);
  if (filters.posterHint) params.set('poster', filters.posterHint);
  params.set('page', page.toString());

  const res = await fetch(`/api/search?${params.toString()}`, { signal });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

// --- Skeleton Card ---
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#0e0e11] border border-white/[0.06] overflow-hidden p-1">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-64 sm:h-auto skeleton rounded-xl" />
        <div className="flex-1 p-6 space-y-4">
          <div className="h-4 w-32 skeleton rounded-md" />
          <div className="h-6 w-3/4 skeleton rounded-md" />
          <div className="h-4 w-1/2 skeleton rounded-md" />
          <div className="h-4 w-2/3 skeleton rounded-md" />
          <div className="pt-4 flex justify-between">
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-9 w-32 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Filter Panel ---
function FilterPanel({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  websites,
}: {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
  websites: Website[];
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden btn-secondary w-full mb-6 py-3 border-purple-500/20"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Filter Results {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
      </button>

      <aside
        className={cn(
          'space-y-6 p-6 rounded-2xl search-filter-panel transition-all duration-300',
          !isOpen && 'hidden lg:block'
        )}
      >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Filters
              </h2>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => onFilterChange({})}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Indexed Websites / Portals Filter (Mini Sidebar) */}
            <FilterGroup title="Indexed Website / Portal">
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                <button
                  onClick={() => onFilterChange({ ...filters, website: undefined })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all',
                    !filters.website
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    All Websites ({websites.length})
                  </span>
                  {!filters.website && <span className="text-cyan-400">✓</span>}
                </button>

                {websites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => onFilterChange({
                      ...filters,
                      website: filters.website === site.id ? undefined : site.id,
                    })}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                      filters.website === site.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center overflow-hidden p-0.5 shrink-0">
                        <WebsiteLogo
                          homepageUrl={site.homepageUrl}
                          logoUrl={site.logoUrl}
                          name={site.name}
                          imgClassName="w-full h-full"
                        />
                      </span>
                      <span className="truncate">{site.name}</span>
                    </span>
                    {filters.website === site.id && <span className="text-cyan-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {/* Category Filter */}
            <FilterGroup title="Category">
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => onFilterChange({
                      ...filters,
                      category: filters.category === cat.slug ? undefined : cat.slug,
                    })}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                      filters.category === cat.slug
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-inner'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{cat.icon}</span>
                      {cat.name}
                    </span>
                    {filters.category === cat.slug && <span className="text-xs text-purple-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {/* Language Filter */}
            <FilterGroup title="Language">
              <div className="space-y-1">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => onFilterChange({
                      ...filters,
                      language: filters.language === lang.value ? undefined : lang.value,
                    })}
                    className={cn(
                      'w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between',
                      filters.language === lang.value
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    {lang.label}
                    {filters.language === lang.value && <span className="text-blue-400">✓</span>}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {/* Quality Filter */}
            <FilterGroup title="Resolution / Quality">
              <div className="grid grid-cols-2 gap-1.5">
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    key={q.value}
                    onClick={() => onFilterChange({
                      ...filters,
                      quality: filters.quality === q.value ? undefined : q.value,
                    })}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-bold text-center transition-all',
                      filters.quality === q.value
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:bg-white/[0.08]'
                    )}
                  >
                    {q.value.toUpperCase()}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {/* Status Filter */}
            <FilterGroup title="Status">
              <div className="space-y-1">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => onFilterChange({
                      ...filters,
                      status: filters.status === s.value ? undefined : s.value,
                    })}
                    className={cn(
                      'w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between',
                      filters.status === s.value
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    {s.label}
                    {filters.status === s.value && <span className="text-cyan-400">✓</span>}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {/* Sort */}
            <FilterGroup title="Sort Results">
              <div className="space-y-1">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => onFilterChange({
                      ...filters,
                      sort: filters.sort === s.value ? undefined : s.value,
                    })}
                    className={cn(
                      'w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between',
                      filters.sort === s.value
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    {s.label}
                    {filters.sort === s.value && <span className="text-emerald-400">✓</span>}
                  </button>
                ))}
              </div>
            </FilterGroup>
          </aside>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5">{title}</h3>
      {children}
    </div>
  );
}

// --- Main Search Content ---
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addRecentSearch, recentSearches } = useSearchStore();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') as SearchFilters['category'] | null;
  const initialImdbId = searchParams.get('imdbId') || undefined;
  const initialPoster = searchParams.get('poster') || undefined;
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const f: SearchFilters = {};
    if (initialCategory) f.category = initialCategory;
    if (initialImdbId) f.imdbId = initialImdbId;
    if (initialPoster) f.posterHint = initialPoster;
    return f;
  });
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastWrittenUrlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSearch = useCallback((nextQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setQuery(nextQuery);
    setDebouncedQuery(nextQuery);
    setPage(1);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync from URL only on external navigation (back/forward, deep link) — not our own router.replace
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlKey = params.toString();
    if (urlKey === lastWrittenUrlRef.current) return;

    const q = searchParams.get('q') || '';
    const imdbId = searchParams.get('imdbId') || undefined;
    const poster = searchParams.get('poster') || undefined;
    const category = searchParams.get('category') as SearchFilters['category'] | null;

    setQuery(q);
    setDebouncedQuery(q);
    setPage(1);
    setFilters((prev) => {
      const next: SearchFilters = {};
      if (category) next.category = category;
      if (imdbId) next.imdbId = imdbId;
      if (poster) next.posterHint = poster;
      const language = searchParams.get('language') as SearchFilters['language'] | null;
      const quality = searchParams.get('quality') as SearchFilters['quality'] | null;
      const status = searchParams.get('status') as SearchFilters['status'] | null;
      const sort = searchParams.get('sort') as SearchFilters['sort'] | null;
      const website = searchParams.get('website') || undefined;
      if (language) next.language = language;
      if (quality) next.quality = quality;
      if (status) next.status = status;
      if (sort) next.sort = sort;
      if (website) next.website = website;
      return next;
    });
  }, [searchParams]);

  // Debounce typing — never fight the input while user edits
  useEffect(() => {
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Keep URL in sync with committed search state
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.language) params.set('language', filters.language);
    if (filters.quality) params.set('quality', filters.quality);
    if (filters.status) params.set('status', filters.status);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.website) params.set('website', filters.website);
    if (filters.imdbId) params.set('imdbId', filters.imdbId);
    if (filters.posterHint) params.set('poster', filters.posterHint);

    const urlKey = params.toString();
    lastWrittenUrlRef.current = urlKey;
    router.replace(urlKey ? `/search?${urlKey}` : '/search', { scroll: false });

    if (debouncedQuery) addRecentSearch(debouncedQuery);
  }, [debouncedQuery, filters, router, addRecentSearch]);

  // Fetch search results
  const { data, isLoading, isFetching, error, fetchStatus } = useQuery({
    queryKey: ['search', debouncedQuery, filters, page],
    queryFn: ({ signal }) => fetchSearch(debouncedQuery, filters, page, signal),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isTypingPending = query.trim() !== debouncedQuery.trim();
  const isSearchPending = isFetching || fetchStatus === 'fetching' || isTypingPending;
  const resultsData =
    debouncedQuery.trim() && !isSearchPending && data ? data : null;
  const showLoadingState = Boolean(debouncedQuery.trim() && isSearchPending);

  const { target: handoffTarget, requestHandoff, clearHandoff } = useSiteHandoff();

  const handleVisitSource = useCallback(
    (source: NonNullable<SearchResult['sources']>[number], title: string) => {
      requestHandoff(source, title);
    },
    [requestHandoff]
  );

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Fetch live IMDb/TMDB autocomplete suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: suggestionData } = useQuery<{ suggestions: { title: string; year: number | null; category: string; poster: string | null; imdbId?: string }[] }>({
    queryKey: ['suggestions', query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return { suggestions: [] };
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) return { suggestions: [] };
      return res.json();
    },
    enabled: query.trim().length >= 2,
  });

  const suggestionsList = suggestionData?.suggestions || [];

  // Only dismiss keyboard after user picks a suggestion or presses Enter — not while editing

  const { data: websitesData } = useQuery<Website[]>({
    queryKey: ['public-websites'],
    queryFn: async () => {
      const res = await fetch('/api/websites');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const websites = websitesData || [];

  // Hide suggestions when clicking outside search input or clicking page content
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-input-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  return (
    <div className="search-page min-h-screen py-8 sm:py-10 page-gutter">
      <SiteHandoffModal target={handoffTarget} onClose={clearHandoff} />
      {/* Official YouTube Trailer Modal */}
      <AnimatePresence>
        {activeTrailerKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setActiveTrailerKey(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 aspect-video"
            >
              <button
                onClick={() => setActiveTrailerKey(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-white/20 text-white font-bold transition-all border border-white/20"
                aria-label="Close trailer"
              >
                ✕
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${activeTrailerKey}?autoplay=1`}
                title="Official Trailer"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="page-shell mx-auto">
        {/* Page header */}
        <div className="search-page-hero">
          <p className="search-page-eyebrow text-xs font-bold uppercase tracking-widest text-[#e8b86d]/70 mb-2">MoviesNet Search</p>
          <h1 className="search-page-title font-display text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            Find your title across every indexed site
          </h1>

          <div className="search-page-category-rail websites-filter-rail flex items-center gap-2 overflow-x-auto pb-1 mb-5 sm:mb-6 no-scrollbar">
            {[
              { id: undefined, label: 'All' },
              { id: 'movies' as const, label: 'Movies' },
              { id: 'tv-shows' as const, label: 'TV Shows' },
              { id: 'anime' as const, label: 'Anime' },
              { id: 'manga' as const, label: 'Manga' },
              { id: 'sports' as const, label: 'Sports' },
              { id: 'live-tv' as const, label: 'Live TV' },
            ].map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleFilterChange({ ...filters, category: cat.id })}
                className={cn(
                  'search-category-pill',
                  filters.category === cat.id ? 'search-category-pill-active' : 'search-category-pill-inactive'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-3xl search-input-container hero-search-wrapper search-page-input-wrap">
            <div className="search-page-input-icon absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#e8b86d]/80 pointer-events-none">
              <svg className="w-5 h-5 sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                setShowSuggestions(val.trim().length >= 2);
                if (filters.imdbId || filters.posterHint) {
                  setFilters((prev) => {
                    const next = { ...prev };
                    delete next.imdbId;
                    delete next.posterHint;
                    return next;
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  flushSearch(query);
                  setShowSuggestions(false);
                  dismissMobileKeyboard();
                }
                if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              placeholder="Search movies, anime, TV…"
              className="search-input w-full text-base py-3.5 sm:py-4 pl-11 sm:pl-12 pr-16 sm:pr-16"
              autoFocus
              aria-busy={isFetching && !isTypingPending}
              aria-label="Search"
            />
            {isFetching && !isTypingPending && debouncedQuery.trim() && (
              <span
                className="absolute right-11 sm:right-12 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#e8b86d]/30 border-t-[#e8b86d] animate-spin"
                aria-hidden
              />
            )}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  flushSearch('');
                  setShowSuggestions(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/[0.08] text-white/40 hover:text-white transition-all"
                aria-label="Clear search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Live IMDb / TMDB Autocomplete Suggestions Dropdown */}
            <AnimatePresence initial={false}>
              {showSuggestions && suggestionsList.length > 0 && (
                <SearchSuggestionsSlider
                  suggestions={suggestionsList}
                  variant="search"
                  layout="inline"
                  onSelect={(item) => {
                    setShowSuggestions(false);
                    dismissMobileKeyboard();
                    flushSearch(item.title);
                    setFilters((prev) => ({
                      ...prev,
                      imdbId: item.imdbId,
                      posterHint: item.poster || undefined,
                    }));
                    router.push(buildSearchUrlFromSuggestion(item));
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Spell correction */}
          {data?.correction && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3.5 text-sm text-white/50 font-medium"
            >
              Did you mean{' '}
              <button
                type="button"
                onClick={() => flushSearch(data.correction!)}
                className="text-[#e8b86d] hover:text-[#f0c987] font-semibold underline underline-offset-4"
              >
                {data.correction}
              </button>
              ?
            </motion.p>
          )}

          {/* Search telemetry meta */}
          {resultsData && debouncedQuery && (
            <div className="search-page-meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/40">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {resultsData.totalResults} results found
              </span>
              <span>•</span>
              <span>{resultsData.results[0]?.sources?.length || 0} sites available</span>
              <span>•</span>
              <span>{resultsData.searchTime}ms</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="home-content-below flex flex-col lg:flex-row gap-8">
          {/* Sticky Filters Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              isOpen={isFilterOpen}
              onToggle={() => setFilterOpen(!isFilterOpen)}
              websites={websites}
            />
          </div>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Empty state - no query */}
            {!debouncedQuery && (
              <div className="py-8 px-4 sm:px-6 rounded-2xl search-hero-card border border-white/10">
                <div className="text-center max-w-lg mx-auto mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#e8b86d]/10 border border-[#e8b86d]/25 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e8b86d]">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">Search everywhere at once</h2>
                  <p className="text-sm text-white/45 leading-relaxed">
                    Type any title above to find which of your indexed sites have it.
                  </p>
                </div>

                {mounted && recentSearches.length > 0 && (
                  <div className="max-w-md mx-auto text-center mt-6">
                    <h3 className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">Recent searches</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => flushSearch(term)}
                          className="search-category-pill search-category-pill-inactive hover:text-white"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <SearchTrendingPicks onSelect={(title) => flushSearch(title)} />
              </div>
            )}

            {/* Compact loading — no full-screen magic overlay */}
            {showLoadingState && (
              <div className="space-y-4">
                <div className="h-0.5 w-full max-w-3xl bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="search-progress-bar h-full w-1/3 bg-gradient-to-r from-transparent via-[#e8b86d] to-transparent" />
                </div>
                <SkeletonCard />
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-16 rounded-2xl bg-red-500/5 border border-red-500/10">
                <p className="text-red-400 font-semibold mb-1">Search encountered an error</p>
                <p className="text-xs text-white/30">Please try refreshing or adjusting your query</p>
              </div>
            )}

            {/* Results List */}
            {resultsData && (
              <>
                {/* Disambiguation Selector ("Did you mean?") */}
                {resultsData.candidates && resultsData.candidates.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900/70 border border-purple-500/30 backdrop-blur-xl mb-6 shadow-2xl"
                  >
                    <div className="flex items-center gap-2 mb-2 text-xs font-black text-purple-300 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      Did you mean? (Select Specific Title)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resultsData.candidates.map((candidate) => (
                        <button
                          key={`${candidate.tmdbId || candidate.title}-${candidate.year}`}
                          onClick={() => flushSearch(`${candidate.title} ${candidate.year || ''}`.trim())}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-purple-500/30 border border-white/20 hover:border-purple-400 transition-all text-xs font-bold text-white shadow-md group"
                        >
                          <span>{candidate.title}</span>
                          {candidate.year && <span className="text-[11px] text-purple-300 font-semibold">({candidate.year})</span>}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 border border-purple-500/30">
                            {candidate.confidenceScore}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Website filter — only sites where this title is available */}
                {resultsData.results[0]?.sources && resultsData.results[0].sources.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, website: undefined })}
                    className={cn(
                      'search-category-pill',
                      !filters.website ? 'search-category-pill-active' : 'search-category-pill-inactive'
                    )}
                  >
                    All {resultsData.results[0].sources.length} available
                  </button>
                  {resultsData.results[0].sources.slice(0, 20).map((source) => (
                    <button
                      key={source.websiteId}
                      type="button"
                      onClick={() => setFilters({ ...filters, website: filters.website === source.websiteId ? undefined : source.websiteId })}
                      className={cn(
                        'search-category-pill flex items-center gap-1.5',
                        filters.website === source.websiteId ? 'search-category-pill-active' : 'search-category-pill-inactive'
                      )}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-black/30 flex items-center justify-center overflow-hidden p-0.5">
                        <WebsiteLogo
                          homepageUrl={source.url}
                          logoUrl={source.websiteLogo}
                          name={source.websiteName}
                          imgClassName="w-full h-full"
                        />
                      </span>
                      <span>{source.websiteName}</span>
                    </button>
                  ))}
                </div>
                )}

                {resultsData.results.length > 0 ? (
                  <div className="space-y-6">
                    <SearchHeroResult
                      result={resultsData.results[0]}
                      onVisitSource={(source) => handleVisitSource(source, resultsData.results[0].title)}
                      onTrailer={setActiveTrailerKey}
                    />

                    {/* Official licensed providers */}
                    {resultsData.results[0].officialProviders && resultsData.results[0].officialProviders.length > 0 && (
                      <div className="search-hero-card rounded-2xl border border-white/10 p-5 sm:p-6">
                        <h3 className="font-display text-sm font-bold text-white mb-3">Official streaming providers</h3>
                        <div className="flex flex-wrap gap-2">
                          {resultsData.results[0].officialProviders.map((provider) => (
                            <a
                              key={provider.id}
                              href={provider.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/80 text-xs font-semibold transition-all flex items-center gap-2 hover:border-[#e8b86d]/35 hover:bg-[#e8b86d]/5"
                            >
                              {provider.logo && (
                                <img src={provider.logo} alt={provider.name} className="w-5 h-5 rounded" />
                              )}
                              <span>{provider.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 capitalize">
                                {provider.type === 'flatrate' ? 'Stream' : provider.type === 'rent' ? 'Rent' : 'Buy'}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cast */}
                    {resultsData.results[0].cast && resultsData.results[0].cast.length > 0 && (
                      <div className="search-hero-card rounded-2xl border border-white/10 p-5 sm:p-6">
                        <h3 className="font-display text-sm font-bold text-white mb-3">Top cast</h3>
                        <div className="flex flex-wrap gap-3">
                          {resultsData.results[0].cast.map((actor, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-2 bg-white/[0.03] p-1.5 pr-3 rounded-xl border border-white/10">
                              <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                                {actor.profilePath ? (
                                  <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-bold text-[#e8b86d]">{actor.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-semibold text-white leading-tight">{actor.name}</div>
                                <div className="text-[10px] text-white/45 leading-tight">{actor.character}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Similar titles */}
                    {resultsData.results[0].similarTitles && resultsData.results[0].similarTitles.length > 0 && (
                      <div className="search-hero-card rounded-2xl border border-white/10 p-5 sm:p-6">
                        <h3 className="font-display text-sm font-bold text-white mb-3">Similar titles</h3>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {resultsData.results[0].similarTitles.map((sim) => (
                            <button
                              key={sim.id}
                              type="button"
                              onClick={() => flushSearch(sim.title)}
                              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/[0.03] hover:bg-[#e8b86d]/10 border border-white/10 hover:border-[#e8b86d]/25 transition-all text-left flex-shrink-0 group"
                            >
                              <div className="w-7 h-10 rounded bg-black/50 overflow-hidden flex-shrink-0 border border-white/10">
                                {sim.poster ? (
                                  <img src={sim.poster} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                  <span className="text-[8px] font-bold text-[#e8b86d] flex items-center justify-center h-full">🎬</span>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-white group-hover:text-[#e8b86d] line-clamp-1">{sim.title}</div>
                                {sim.year && <div className="text-[10px] text-white/40">{sim.year}</div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  debouncedQuery && (
                    <div className="text-center py-20 px-4 rounded-3xl bg-[#0e0e11]/50 border border-white/[0.06]">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 text-3xl">
                        🔍
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">No matching content found</h2>
                      <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
                        No configured website returned results for &ldquo;{debouncedQuery}&rdquo;. Try another term or clear your filters.
                      </p>
                      {resultsData.suggestions.length > 0 && (
                        <div>
                          <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Suggested Titles:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {resultsData.suggestions.map((s) => (
                              <button
                                key={s}
                                onClick={() => flushSearch(s)}
                                className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Page Export with Suspense ---
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-10 page-gutter">
        <div className="page-shell mx-auto">
          <div className="h-16 w-full max-w-4xl skeleton rounded-2xl mb-10" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-72 h-96 skeleton rounded-2xl hidden lg:block" />
            <div className="flex-1 space-y-4">
              {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
