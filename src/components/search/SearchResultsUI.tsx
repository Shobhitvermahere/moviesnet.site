'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, QUALITY_COLORS, resolveMoviePoster } from '@/lib/utils';
import { formatLanguageLabel } from '@/lib/website-capabilities';
import { WebsiteLogo } from '@/components/WebsiteLogo';
import type { SearchResult, StreamingSource } from '@/types';

export interface SiteHandoffTarget {
  websiteName: string;
  websiteLogo: string;
  url: string;
  title: string;
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function SiteHandoffModal({
  target,
  onClose,
}: {
  target: SiteHandoffTarget | null;
  onClose: () => void;
}) {
  if (!target) return null;

  const hostname = extractHostname(target.url);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
          aria-label="Close"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md search-handoff-card rounded-2xl p-6 sm:p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 p-2">
              <WebsiteLogo
                homepageUrl={target.url}
                logoUrl={target.websiteLogo}
                name={target.websiteName}
                imgClassName="w-full h-full"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#e8b86d]/80">Leaving MoviesNet</p>
              <h3 className="font-display text-xl font-bold text-white truncate">{target.websiteName}</h3>
              <p className="text-xs text-white/45 truncate">{hostname}</p>
            </div>
          </div>

          <p className="text-sm text-white/65 leading-relaxed mb-6">
            You&apos;ll be taken to <span className="text-white font-semibold">{target.websiteName}</span> to search for{' '}
            <span className="text-[#e8b86d] font-semibold">&ldquo;{target.title}&rdquo;</span>. MoviesNet does not host content — we only redirect you to the original source.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#e8b86d] text-[#1a1208] font-display font-bold text-sm hover:bg-[#f0c987] transition-colors"
            >
              Continue to site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-white/15 text-white/70 font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              Stay here
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function useSiteHandoff() {
  const [target, setTarget] = useState<SiteHandoffTarget | null>(null);

  const requestHandoff = (source: StreamingSource, title: string) => {
    setTarget({
      websiteName: source.websiteName,
      websiteLogo: source.websiteLogo,
      url: source.url,
      title,
    });
  };

  return { target, requestHandoff, clearHandoff: () => setTarget(null) };
}

export const SOURCES_INITIAL_VISIBLE = 15;

function SourceRowDetailed({
  source,
  rank,
  onVisit,
}: {
  source: StreamingSource;
  rank: number;
  onVisit: (source: StreamingSource) => void;
}) {
  let hostname = '';
  try {
    hostname = new URL(source.url).hostname.replace(/^www\./, '');
  } catch {
    hostname = source.url;
  }

  return (
    <button
      type="button"
      onClick={() => onVisit(source)}
      className="search-source-card search-source-card-full group text-left w-full p-5 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#e8b86d]/35 transition-all"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <span className="text-sm font-mono font-bold text-[#e8b86d]/60 w-8 shrink-0 text-center">
          {rank}
        </span>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg p-1.5">
          <WebsiteLogo
            homepageUrl={source.url}
            logoUrl={source.websiteLogo}
            name={source.websiteName}
            imgClassName="w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <p className="text-lg sm:text-xl font-display font-bold text-white group-hover:text-[#e8b86d] transition-colors">
              {source.websiteName}
            </p>
            {source.verified && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-white/40 mb-3">{hostname}</p>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {source.quality.map((q) => (
              <span
                key={q}
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-lg border',
                  QUALITY_COLORS[q] || 'bg-white/10 text-white/60 border-white/15'
                )}
              >
                {q === '4k' ? '4K UHD' : q.toUpperCase()}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/55">
            <p>
              <span className="text-white/35">Audio · </span>
              {source.languages.map(formatLanguageLabel).join(', ')}
            </p>
            {source.subtitles.length > 0 && (
              <p>
                <span className="text-white/35">Subs · </span>
                {source.subtitles.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#e8b86d] text-[#1a1208] flex items-center justify-center group-hover:bg-[#f0c987] transition-colors shadow-lg shadow-[#e8b86d]/20">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
  );
}

export function StreamingSourcesPanel({
  sources,
  onVisit,
  initialVisible = SOURCES_INITIAL_VISIBLE,
}: {
  sources: StreamingSource[];
  title?: string;
  onVisit: (source: StreamingSource) => void;
  showAll?: boolean;
  initialVisible?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-white/45">No matching sites in your directory for this title.</p>
      </div>
    );
  }

  const hasMore = sources.length > initialVisible;
  const visible = expanded ? sources : sources.slice(0, initialVisible);
  const remaining = sources.length - initialVisible;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl font-bold text-white">Available on your sites</h3>
        <p className="text-sm text-white/45 mt-1">
          Top {visible.length} of {sources.length} category-matched {sources.length === 1 ? 'site' : 'sites'} · priority order
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {visible.map((source, idx) => (
            <motion.div
              key={source.websiteId}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, delay: idx > initialVisible - 1 ? (idx - initialVisible) * 0.03 : 0 }}
            >
              <SourceRowDetailed source={source} rank={idx + 1} onVisit={onVisit} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="search-sources-expand-btn group w-full"
          aria-expanded={expanded}
        >
          <span className="search-sources-expand-btn-inner">
            <span className="flex flex-col items-start sm:items-center sm:flex-row sm:gap-3">
              <span className="font-display text-base sm:text-lg font-bold text-white group-hover:text-[#e8b86d] transition-colors">
                {expanded ? 'Show fewer sites' : `Load ${remaining} more sites`}
              </span>
              <span className="text-xs text-white/45 mt-0.5 sm:mt-0">
                {expanded ? 'Collapse to top 15' : `See all ${sources.length} available sources`}
              </span>
            </span>
            <span
              className={cn(
                'search-sources-expand-chevron shrink-0 transition-transform duration-300',
                expanded && 'rotate-180'
              )}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export function SearchHeroResult({
  result,
  onVisitSource,
  onTrailer,
}: {
  result: SearchResult;
  websitesSearched?: number;
  onVisitSource: (source: StreamingSource) => void;
  onTrailer?: (key: string) => void;
}) {
  const poster = result.poster || resolveMoviePoster(result.title, result.category);
  const sources = result.sources || [];
  const availableCount = sources.length;

  const detailItems = [
    result.year ? { label: 'Year', value: String(result.year) } : null,
    result.runtime ? { label: 'Runtime', value: result.runtime } : null,
    result.status ? { label: 'Status', value: result.status.replace('-', ' ') } : null,
    result.seasonCount ? { label: 'Seasons', value: String(result.seasonCount) } : null,
    result.episodeCount ? { label: 'Episodes', value: String(result.episodeCount) } : null,
    result.languages?.length ? { label: 'Audio', value: result.languages.slice(0, 3).join(', ') } : null,
    result.quality?.length ? { label: 'Quality', value: result.quality.join(', ').toUpperCase() } : null,
    result.rating ? { label: 'Rating', value: `★ ${result.rating.toFixed(1)}` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="search-result-detail-card search-hero-card relative overflow-hidden rounded-2xl border border-white/10 shadow-xl"
    >
      {result.backdrop && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${result.backdrop})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c12]/96 via-[#0d1018]/94 to-[#080a10]/96 pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-row gap-4 sm:gap-6">
          <div className="relative w-28 sm:w-36 lg:w-44 shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/15 shadow-2xl bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster}
                alt={result.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = resolveMoviePoster(result.title, result.category);
                }}
              />
            </div>
            {result.rating && (
              <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-lg bg-[#e8b86d] text-[#1a1208] text-[10px] sm:text-xs font-black shadow-lg">
                ★ {result.rating.toFixed(1)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              {result.confidenceScore && (
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  IMDb {result.confidenceScore}%
                </span>
              )}
              {result.category && (
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/5 text-white/55 border border-white/10 capitalize">
                  {result.category.replace('-', ' ')}
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#e8b86d]/10 text-[#e8b86d] border border-[#e8b86d]/25">
                {availableCount} {availableCount === 1 ? 'site' : 'sites'}
              </span>
            </div>

            <h2 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mb-1.5 sm:mb-2 leading-tight">
              {result.title}
            </h2>

            {result.originalTitle && result.originalTitle !== result.title && (
              <p className="text-xs text-white/45 mb-2 truncate">{result.originalTitle}</p>
            )}

            {result.genres && result.genres.length > 0 && (
              <p className="text-xs sm:text-sm text-white/50 mb-2 sm:mb-3 line-clamp-2">
                {result.genres.slice(0, 4).join(' · ')}
              </p>
            )}

            {detailItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {detailItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1.5 sm:px-2.5 sm:py-2"
                  >
                    <p className="text-[9px] uppercase tracking-wide text-white/35 font-semibold">{item.label}</p>
                    <p className="text-[11px] sm:text-xs font-semibold text-white/80 capitalize truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {result.overview && (
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed line-clamp-3 sm:line-clamp-4 mb-3 sm:mb-4">
                {result.overview}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {result.trailerKey && onTrailer && (
                <button
                  type="button"
                  onClick={() => onTrailer(result.trailerKey!)}
                  className="px-3 py-2 rounded-xl border border-white/15 text-white text-xs font-semibold hover:bg-white/5 transition-colors"
                >
                  ▶ Trailer
                </button>
              )}
              {result.imdbId && (
                <a
                  href={`https://www.imdb.com/title/${result.imdbId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-white/15 text-[#e8b86d] text-xs font-semibold hover:bg-white/5 transition-colors"
                >
                  IMDb
                </a>
              )}
              {sources[0] && (
                <button
                  type="button"
                  onClick={() => onVisitSource(sources[0])}
                  className="px-4 py-2 rounded-xl bg-[#e8b86d] text-[#1a1208] font-display font-bold text-xs sm:text-sm hover:bg-[#f0c987] transition-colors inline-flex items-center gap-1.5"
                >
                  Watch
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {sources.length > 0 && (
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/10">
            <StreamingSourcesPanel sources={sources} onVisit={onVisitSource} />
          </div>
        )}
      </div>
    </motion.article>
  );
}
