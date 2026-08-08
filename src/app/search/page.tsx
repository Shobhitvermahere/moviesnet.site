'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchStore } from '@/stores';
import { cn, CATEGORIES, QUALITY_COLORS, STATUS_COLORS, resolveMoviePoster } from '@/lib/utils';
import type { SearchResponse, SearchFilters, SearchResult, ContentCategory, Language, Quality, ContentStatus, SortOption } from '@/types';

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
  { value: 'latest', label: 'Latest' },
  { value: 'highest-quality', label: 'Highest Quality' },
  { value: 'most-sources', label: 'Most Sources' },
];

// --- Fetch search results ---
async function fetchSearch(query: string, filters: SearchFilters, page: number): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (filters.category) params.set('category', filters.category);
  if (filters.language) params.set('language', filters.language);
  if (filters.quality) params.set('quality', filters.quality);
  if (filters.status) params.set('status', filters.status);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.website) params.set('website', filters.website);
  params.set('page', page.toString());

  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const fallbackPoster = resolveMoviePoster(result.title, result.category, index);

  const sourcesList = result.sources || [];
  const displaySources = sourcesList.slice(0, showSources ? sourcesList.length : 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group relative rounded-2xl apple-glass-card spatial-card overflow-hidden spotlight mb-6"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="relative w-full sm:w-52 h-72 sm:h-auto flex-shrink-0 bg-[#141419] overflow-hidden flex items-center justify-center">
          {imgError || (!result.poster && !fallbackPoster) ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-center border-r border-white/10">
              <svg className="w-12 h-12 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
              </svg>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No Poster</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1">Available</span>
            </div>
          ) : (
            <img
              src={imgError || !result.poster ? fallbackPoster : result.poster}
              alt={result.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-black/30 sm:hidden" />

          {/* Quality badges */}
          {result.quality.length > 0 ? (
            <div className="absolute top-3 left-3 flex gap-1 z-10">
              {result.quality.slice(0, 2).map((q) => (
                <span key={q} className="badge text-[10px] px-2.5 py-0.5 font-black uppercase rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-white/30 shadow-md">
                  {q === '4k' ? '4K UHD' : q.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <div className="absolute top-3 left-3 z-10">
              <span className="badge text-[10px] px-2.5 py-0.5 font-black uppercase rounded-full bg-cyan-500 text-white border border-white/30 shadow-md">
                1080P FULL HD
              </span>
            </div>
          )}

          {/* TMDB Verified Confidence badge */}
          {result.confidenceScore && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TMDB {result.confidenceScore}% Match
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Category & Website Portal Row */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {result.websiteLogo && !logoError ? (
                    <img src={result.websiteLogo} alt="" className="w-full h-full object-cover" loading="lazy" onError={() => setLogoError(true)} />
                  ) : (
                    <span className="text-[9px] font-black text-cyan-300">{result.websiteName.charAt(0)}</span>
                  )}
                </div>
                <span className="text-xs font-black text-cyan-300 tracking-wide uppercase">
                  {result.websiteName}
                </span>
                {sourcesList.length > 0 && (
                  <span className="text-[10.5px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    ⚡ {sourcesList.length} Mirrors
                  </span>
                )}
              </div>
              {result.category && (
                <span className="text-[10px] font-black text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full capitalize">
                  {result.category.replace('-', ' ')}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
              {result.title}
            </h3>

            {/* Original Title if present */}
            {result.originalTitle && result.originalTitle !== result.title && (
              <p className="text-xs text-white/50 italic mb-2">
                Original: {result.originalTitle}
              </p>
            )}

            {/* Meta badges row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/60 mb-3">
              {result.year && <span className="font-extrabold text-white/90 bg-white/10 px-2 py-0.5 rounded-md">{result.year}</span>}
              {result.rating && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-xs shadow-sm">
                  ★ {result.rating.toFixed(1)}
                </span>
              )}
              {result.runtime && <span className="font-semibold text-white/70">⏱ {result.runtime}</span>}
              {result.episodeCount && <span className="font-semibold text-white/70">📺 {result.episodeCount} Episodes</span>}
              {result.seasonCount && <span className="font-semibold text-white/70">💿 {result.seasonCount} Seasons</span>}
              {result.status && (
                <span className={cn('badge text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border', STATUS_COLORS[result.status] || '')}>
                  {result.status}
                </span>
              )}
            </div>

            {/* Overview / Synopsis */}
            {result.overview && (
              <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-3">
                {result.overview}
              </p>
            )}

            {/* Genres */}
            {result.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {result.genres.slice(0, 5).map((genre) => (
                  <span key={genre} className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-white/70">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Audio Languages & Subtitles Box */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span className="text-cyan-400 font-bold">🔊 Audio:</span>
                <span className="font-black text-white">
                  {result.languages.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span className="text-purple-400 font-bold">💬 Subtitles:</span>
                <span className="font-bold text-white/90">
                  {result.subtitles.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                </span>
              </div>
            </div>

            {/* Consolidated Streaming Sources List */}
            {sourcesList.length > 0 && (
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="font-bold text-cyan-300">Available Streaming Mirrors ({sourcesList.length})</span>
                  {sourcesList.length > 4 && (
                    <button
                      onClick={() => setShowSources(!showSources)}
                      className="text-[11px] font-black text-purple-400 hover:underline"
                    >
                      {showSources ? 'Show Less' : `+ ${sourcesList.length - 4} More Sites`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {displaySources.map((source) => (
                    <a
                      key={source.websiteId}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.06] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 transition-all text-xs text-white font-bold group/src"
                    >
                      <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[9px] font-black text-cyan-300">
                        {source.websiteName.charAt(0)}
                      </div>
                      <span className="truncate group-hover/src:text-cyan-300">{source.websiteName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
            <span className="text-[11px] font-bold text-white/40">
              Primary Mirror: <span className="text-cyan-300 font-black">{result.websiteName}</span>
            </span>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs shadow-lg shadow-purple-500/25 border border-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Watch on {result.websiteName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Magic Loading Overlay Component (In-Page) ---
function MagicLoadingOverlay({ query }: { query: string }) {
  const [step, setStep] = useState(0);

  const steps = [
    { label: 'Identifying content & title', icon: '🔍' },
    { label: 'Gathering IMDb / TMDB verified metadata', icon: '🎬' },
    { label: 'Checking supported providers (109+ portals)', icon: '⚡' },
    { label: 'Preparing unified results', icon: '✨' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="my-8 w-full max-w-xl mx-auto p-8 rounded-3xl bg-gradient-to-b from-[#0d1028] via-[#090b1c] to-[#050612] border border-cyan-500/30 shadow-2xl text-center space-y-6 relative overflow-hidden"
    >
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 mx-auto mb-4 shadow-xl shadow-purple-500/30 animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-[#070914] rounded-[14px] flex items-center justify-center text-2xl">
            ✨
          </div>
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">
          ✨ Magic begins in...
        </h3>
        <p className="text-xs font-semibold text-cyan-300 mt-1">
          Searching across trusted sources for &ldquo;{query}&rdquo;
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 text-left bg-white/[0.03] p-4 rounded-2xl border border-white/10">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-center gap-3 text-xs font-bold transition-all">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all',
                idx <= step
                  ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/40'
                  : 'bg-white/10 text-white/40'
              )}
            >
              {idx <= step ? '✓' : idx + 1}
            </div>
            <span className={idx <= step ? 'text-white font-extrabold' : 'text-white/40'}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-[11px] font-bold text-white/50 animate-pulse">
          Gathering content across all websites...
        </p>
      </div>
    </motion.div>
  );
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
}: {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
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
          'space-y-6 p-6 rounded-2xl bg-[#0d0d10]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl transition-all duration-300',
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
                    All Websites (49)
                  </span>
                  {!filters.website && <span className="text-cyan-400">✓</span>}
                </button>

                {[
                  { id: '1flex', name: '1FLEX' },
                  { id: '1-show', name: '1 Show' },
                  { id: '1tube', name: '1TUBE' },
                  { id: '7-movies', name: '7 movies' },
                  { id: 'cinezo', name: 'CINEZO' },
                  { id: 'arrow-tv', name: 'ARROW TV' },
                  { id: 'redflix', name: 'REDFLIX' },
                  { id: 'shuttle-tv', name: 'SHUTTLE TV' },
                  { id: 'prime-shows', name: 'PRIME SHOWS' },
                  { id: 'you-shows', name: 'YOU SHOWS' },
                  { id: 'flixhub', name: 'FLIXHUB' },
                  { id: 'streammovies', name: 'STREAMMOVIES' },
                  { id: 'dulo', name: 'DULO' },
                  { id: 'stigstream', name: 'STIGSTREAM' },
                  { id: 'flixeo', name: 'FLIXEO' },
                  { id: 'willow', name: 'WILLOW' },
                  { id: 'cinrift', name: 'CINRIFT' },
                ].map((site) => (
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
                      <span className="w-3.5 h-3.5 rounded bg-white/10 flex items-center justify-center text-[9px] font-black text-cyan-300">
                        {site.name.charAt(0)}
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
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const f: SearchFilters = {};
    if (initialCategory) f.category = initialCategory;
    return f;
  });
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Update URL when query or filters change
  useEffect(() => {
    if (debouncedQuery) {
      const params = new URLSearchParams();
      params.set('q', debouncedQuery);
      if (filters.category) params.set('category', filters.category);
      if (filters.language) params.set('language', filters.language);
      if (filters.quality) params.set('quality', filters.quality);
      if (filters.status) params.set('status', filters.status);
      if (filters.sort) params.set('sort', filters.sort);
      router.replace(`/search?${params.toString()}`, { scroll: false });
      addRecentSearch(debouncedQuery);
    }
  }, [debouncedQuery, filters, router, addRecentSearch]);

  // Fetch search results
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['search', debouncedQuery, filters, page],
    queryFn: () => fetchSearch(debouncedQuery, filters, page),
    enabled: debouncedQuery.length > 0,
    placeholderData: (prev) => prev,
  });

  // Only show magic loading card if fetching takes longer than 350ms; otherwise show direct results
  useEffect(() => {
    if ((isLoading || isFetching) && debouncedQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        setIsMagicLoading(true);
      }, 350);
      return () => {
        clearTimeout(timer);
        setIsMagicLoading(false);
      };
    } else {
      setIsMagicLoading(false);
    }
  }, [isLoading, isFetching, debouncedQuery]);

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Fetch live IMDb/TMDB autocomplete suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: suggestionData } = useQuery<{ suggestions: { title: string; year: number | null; category: string; poster: string | null }[] }>({
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
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
        {/* Category & Discovery Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {[
            { id: undefined, label: '🔥 All Categories' },
            { id: 'movies', label: '🎬 Movies' },
            { id: 'tv-shows', label: '📺 TV Shows' },
            { id: 'anime', label: '⚔️ Anime' },
            { id: 'documentaries', label: '🎙️ Documentaries' },
            { id: 'cartoons', label: '👾 Kids & Cartoons' },
            { id: 'trending', label: '📈 Trending' },
            { id: 'new-releases', label: '🆕 New Releases' },
            { id: 'popular', label: '⭐ Popular' },
            { id: 'top-rated', label: '🏆 Top Rated' },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleFilterChange({ ...filters, category: cat.id as any })}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 border shadow-md',
                filters.category === cat.id
                  ? 'bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 text-white border-purple-400/40 shadow-purple-500/25'
                  : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border-white/10'
              )}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Header */}
        <div className="mb-10">
          <div className="relative max-w-4xl search-input-container">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                setShowSuggestions(val.trim().length >= 2);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                }
              }}
              placeholder="Search movies, anime, TV shows, cartoons across every source..."
              className="search-input text-lg py-5 pl-14 pr-12 shadow-2xl rounded-2xl border-white/[0.12] focus:border-purple-500/50"
              autoFocus
              aria-label="Search"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setDebouncedQuery(''); setShowSuggestions(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-white/[0.08] text-white/40 hover:text-white transition-all"
                aria-label="Clear search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Live IMDb / TMDB Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestionsList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 top-full mt-2.5 bg-[#0e1020]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1"
              >
                <div className="px-3 py-1.5 text-[10.5px] font-black text-purple-400 uppercase tracking-wider flex items-center justify-between border-b border-white/10 mb-1">
                  <span>⚡ Instant IMDb / TMDB Verified Suggestions</span>
                  <span className="text-white/40 font-normal">Press enter or click</span>
                </div>
                {suggestionsList.map((item, idx) => (
                  <button
                    key={`${item.title}-${idx}`}
                    onMouseDown={() => {
                      setQuery(item.title);
                      setDebouncedQuery(item.title);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-500/20 hover:border-purple-500/40 border border-transparent transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-12 rounded-lg bg-black/50 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                        {item.poster ? (
                          <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="text-[9px] font-black text-purple-300">IMDb</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {item.title}
                        </div>
                        {item.year && (
                          <div className="text-xs text-white/50 font-semibold mt-0.5">
                            Released in {item.year}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">
                      {item.category}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
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
                onClick={() => setQuery(data.correction!)}
                className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-4"
              >
                {data.correction}
              </button>
              ?
            </motion.p>
          )}

          {/* Search telemetry meta */}
          {data && debouncedQuery && (
            <div className="mt-3.5 flex items-center gap-3 text-xs text-white/40">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {data.totalResults} results found
              </span>
              <span>•</span>
              <span>{data.websitesSearched} websites searched</span>
              <span>•</span>
              <span>{data.searchTime}ms</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sticky Filters Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              isOpen={isFilterOpen}
              onToggle={() => setFilterOpen(!isFilterOpen)}
            />
          </div>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Empty state - no query */}
            {!debouncedQuery && (
              <div className="text-center py-20 px-4 rounded-3xl bg-[#0e0e11]/50 border border-white/[0.06] backdrop-blur-xl">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Search Everywhere at Once</h2>
                <p className="text-sm text-white/40 max-w-md mx-auto mb-8 leading-relaxed">
                  Type any title above to discover which websites contain the content you are looking for.
                </p>

                {/* Recent searches */}
                {mounted && recentSearches.length > 0 && (
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Recent Searches</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-purple-500/30 transition-all font-medium"
                        >
                          🔍 {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Magic Loading Overlay — Rendered inside the Search Results Section */}
            <AnimatePresence>
              {isMagicLoading && debouncedQuery.length >= 2 && (
                <MagicLoadingOverlay query={debouncedQuery} />
              )}
            </AnimatePresence>

            {/* Loading state skeletons (shown if magic loading is not active) */}
            {isLoading && !isMagicLoading && debouncedQuery && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
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
            {data && !isLoading && (
              <>
                {/* Disambiguation Selector ("Did you mean?") */}
                {data.candidates && data.candidates.length > 1 && (
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
                      {data.candidates.map((candidate) => (
                        <button
                          key={`${candidate.tmdbId || candidate.title}-${candidate.year}`}
                          onClick={() => setQuery(`${candidate.title} ${candidate.year || ''}`.trim())}
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

                {/* Website Mini Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                  <button
                    onClick={() => setFilters({ ...filters, website: undefined })}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0',
                      !filters.website
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border border-cyan-400/30'
                        : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/10'
                    )}
                  >
                    <span>🌐 All {data.websitesSearched || 109} Websites</span>
                  </button>
                  {[
                    { id: '1flex', name: '1FLEX' },
                    { id: '1-show', name: '1 Show' },
                    { id: '1tube', name: '1TUBE' },
                    { id: '7-movies', name: '7 movies' },
                    { id: 'cinezo', name: 'CINEZO' },
                    { id: 'arrow-tv', name: 'ARROW TV' },
                    { id: 'redflix', name: 'REDFLIX' },
                    { id: 'shuttle-tv', name: 'SHUTTLE TV' },
                    { id: 'prime-shows', name: 'PRIME SHOWS' },
                    { id: 'you-shows', name: 'YOU SHOWS' },
                    { id: 'flixhub', name: 'FLIXHUB' },
                    { id: 'streammovies', name: 'STREAMMOVIES' },
                    { id: 'dulo', name: 'DULO' },
                    { id: 'stigstream', name: 'STIGSTREAM' },
                    { id: 'flixeo', name: 'FLIXEO' },
                  ].map((site) => (
                    <button
                      key={site.id}
                      onClick={() => setFilters({ ...filters, website: filters.website === site.id ? undefined : site.id })}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 border',
                        filters.website === site.id
                          ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-md'
                          : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border-white/10'
                      )}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-white/10 flex items-center justify-center text-[9px] font-black text-cyan-300">
                        {site.name.charAt(0)}
                      </span>
                      <span>{site.name}</span>
                    </button>
                  ))}
                </div>

                {data.results.length > 0 ? (
                  <div className="space-y-6">
                    {/* Featured Movie / Show Spotlight Master Unified Title Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b0e26] via-[#101438] to-[#08091a] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
                    >
                      {/* Full-Bleed Backdrop Blur */}
                      {data.results[0].backdrop && (
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-15 blur-xl pointer-events-none"
                          style={{ backgroundImage: `url(${data.results[0].backdrop})` }}
                        />
                      )}

                      <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8">
                        {/* High-Definition Movie Poster */}
                        <div className="relative w-44 sm:w-52 h-64 sm:h-76 rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 bg-black/60 group mx-auto lg:mx-0">
                          <img
                            src={data.results[0].poster || resolveMoviePoster(data.results[0].title, data.results[0].category)}
                            alt={data.results[0].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = resolveMoviePoster(data.results[0].title, data.results[0].category);
                            }}
                          />
                          {data.results[0].confidenceScore && (
                            <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase shadow-md border border-white/30">
                              {data.results[0].confidenceScore}% Match
                            </div>
                          )}
                          {data.results[0].rating && (
                            <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-black text-[11px] shadow-md flex items-center gap-1">
                              ★ {data.results[0].rating.toFixed(1)}/10
                            </div>
                          )}
                        </div>

                        {/* Title & Unified Metadata Details */}
                        <div className="flex-1 text-center lg:text-left space-y-4">
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
                              ✨ UNIFIED TITLE VIEW
                            </span>
                            {data.results[0].category && (
                              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
                                {data.results[0].category.replace('-', ' ')}
                              </span>
                            )}
                          </div>

                          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            {data.results[0].title.replace(/\s*on\s+.*$/i, '')}
                          </h2>

                          {data.results[0].originalTitle && data.results[0].originalTitle !== data.results[0].title && (
                            <p className="text-xs text-white/50 italic">
                              Original Title: {data.results[0].originalTitle}
                            </p>
                          )}

                          {/* Year • Rating • Genres • Runtime */}
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-white/80 font-bold">
                            {data.results[0].year && <span className="text-white font-extrabold">{data.results[0].year}</span>}
                            {data.results[0].rating && (
                              <>
                                <span>•</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                  ⭐ {data.results[0].rating.toFixed(1)} / 10
                                </span>
                              </>
                            )}
                            {data.results[0].genres && data.results[0].genres.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-purple-300 font-extrabold">
                                  {data.results[0].genres.join(' • ')}
                                </span>
                              </>
                            )}
                            {data.results[0].runtime && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-300">⏱ {data.results[0].runtime}</span>
                              </>
                            )}
                            {data.results[0].imdbId && (
                              <>
                                <span>•</span>
                                <a
                                  href={`https://www.imdb.com/title/${data.results[0].imdbId}/`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/40 transition-all"
                                >
                                  IMDb
                                </a>
                              </>
                            )}
                            {data.results[0].sources && data.results[0].sources.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  📡 {data.results[0].sources.length} streaming sites
                                </span>
                              </>
                            )}
                          </div>

                          {/* Overview / Storyline */}
                          <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
                            {data.results[0].overview || `Search results for ${data.results[0].title} across verified streaming providers.`}
                          </p>

                          {/* Action Buttons: Trailer & Fast Stream */}
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                            {data.results[0].trailerKey && (
                              <button
                                onClick={() => setActiveTrailerKey(data.results[0].trailerKey!)}
                                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
                              >
                                <span>▶ Watch Official Trailer</span>
                              </button>
                            )}
                            <a
                              href={data.results[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
                            >
                              <span>🚀 Launch Stream on {data.results[0].websiteName}</span>
                            </a>
                          </div>

                          {/* Official Licensed Providers Grid — Real data from TMDB */}
                          {data.results[0].officialProviders && data.results[0].officialProviders.length > 0 && (
                            <div className="pt-4 border-t border-white/10">
                              <div className="text-[11px] font-black text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span>📺 Official Streaming Providers:</span>
                              </div>
                              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                {data.results[0].officialProviders.map((provider) => (
                                  <a
                                    key={provider.id}
                                    href={provider.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-xs font-black transition-all flex items-center gap-2 hover:scale-105 hover:bg-cyan-500/20"
                                  >
                                    {provider.logo && (
                                      <img src={provider.logo} alt={provider.name} className="w-5 h-5 rounded" />
                                    )}
                                    <span>{provider.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-extrabold capitalize">
                                      {provider.type === 'flatrate' ? 'Stream' : provider.type === 'rent' ? 'Rent' : 'Buy'}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Cast Members Avatars */}
                          {data.results[0].cast && data.results[0].cast.length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                              <div className="text-[11px] font-black text-purple-300 uppercase tracking-wider mb-2">
                                🎭 Top Cast Members:
                              </div>
                              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                {data.results[0].cast.map((actor, aIdx) => (
                                  <div key={aIdx} className="flex items-center gap-2 bg-white/[0.04] p-1.5 pr-3 rounded-xl border border-white/10">
                                    <div className="w-7 h-7 rounded-full bg-purple-500/20 overflow-hidden flex-shrink-0 border border-white/20 flex items-center justify-center">
                                      {actor.profilePath ? (
                                        <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[9px] font-black text-purple-300">{actor.name.charAt(0)}</span>
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[11px] font-bold text-white leading-tight">{actor.name}</div>
                                      <div className="text-[9px] text-white/50 leading-tight">{actor.character}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Similar Titles Carousel */}
                          {data.results[0].similarTitles && data.results[0].similarTitles.length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                              <div className="text-[11px] font-black text-cyan-300 uppercase tracking-wider mb-2">
                                🎬 Similar Titles You May Like:
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {data.results[0].similarTitles.map((sim) => (
                                  <button
                                    key={sim.id}
                                    onClick={() => setQuery(sim.title)}
                                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 border border-white/10 transition-all text-left flex-shrink-0 group"
                                  >
                                    <div className="w-6 h-8 rounded bg-black/50 overflow-hidden flex-shrink-0 border border-white/10">
                                      {sim.poster ? (
                                        <img src={sim.poster} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105" />
                                      ) : (
                                        <span className="text-[8px] font-black text-cyan-300">🎬</span>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 line-clamp-1">{sim.title}</div>
                                      {sim.year && <div className="text-[9px] text-white/40">{sim.year}</div>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Results Cards List */}
                    <div className="flex items-center justify-between px-2 py-1 text-xs font-extrabold text-cyan-300 border-b border-white/10 pb-2">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        {data.totalResults} verified {data.totalResults === 1 ? 'title' : 'titles'} found across {data.websitesSearched} portals
                      </span>
                      <span className="text-white/40 font-normal">TMDB Verified Metadata</span>
                    </div>
                    <div className="space-y-4">
                      {data.results.map((result, idx) => (
                        <SearchResultCard key={result.id} result={result} index={idx} />
                      ))}
                    </div>
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
                      {data.suggestions.length > 0 && (
                        <div>
                          <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Suggested Titles:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {data.suggestions.map((s) => (
                              <button
                                key={s}
                                onClick={() => setQuery(s)}
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

                {/* Load More Button */}
                {data.hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-primary px-8 py-3 rounded-xl font-semibold shadow-xl shadow-purple-500/20"
                    >
                      Load More Results
                    </button>
                  </div>
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
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
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
