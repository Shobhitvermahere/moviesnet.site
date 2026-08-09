'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, QUALITY_COLORS, resolveMoviePoster } from '@/lib/utils';
import { formatLanguageLabel } from '@/lib/website-capabilities';
import { WebsiteLogo } from '@/components/WebsiteLogo';
import type { SearchResult, StreamingSource } from '@/types';
import { formatLatency } from '@/lib/website-latency';

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
      className="search-source-box search-source-card group text-left w-full rounded-xl border border-white/10 bg-[#0c0f16] hover:bg-[#10141d] hover:border-[#e8b86d]/30 active:scale-[0.99] transition-all"
    >
      <div className="search-source-box-inner flex items-start gap-3 p-3 sm:p-4">
        <div className="search-source-rank shrink-0 w-7 h-7 rounded-lg bg-[#e8b86d]/10 border border-[#e8b86d]/20 flex items-center justify-center">
          <span className="text-[11px] font-mono font-bold text-[#e8b86d]">{rank}</span>
        </div>
        <div className="search-source-logo w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
          <WebsiteLogo
            homepageUrl={source.url}
            logoUrl={source.websiteLogo}
            name={source.websiteName}
            imgClassName="w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <p className="text-sm sm:text-base font-display font-bold text-white group-hover:text-[#e8b86d] transition-colors truncate">
              {source.websiteName}
            </p>
            {source.verified && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 shrink-0">
                Verified
              </span>
            )}
            {formatLatency(source.responseTimeMs) && (
              <span
                className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0',
                  rank === 1
                    ? 'bg-[#e8b86d]/15 text-[#e8b86d] border-[#e8b86d]/25'
                    : 'bg-white/[0.04] text-white/45 border-white/10'
                )}
              >
                {formatLatency(source.responseTimeMs)}
              </span>
            )}
            {source.responseTimeMs == null && source.reachable === false && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-300/80 border border-red-500/20 shrink-0">
                Slow / offline
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-white/40 mb-2 truncate">{hostname}</p>
          <div className="flex flex-wrap gap-1.5">
            {source.quality.slice(0, 3).map((q) => (
              <span
                key={q}
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                  QUALITY_COLORS[q] || 'bg-white/10 text-white/60 border-white/15'
                )}
              >
                {q === '4k' ? '4K' : q.toUpperCase()}
              </span>
            ))}
            {source.languages.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-white/50 truncate max-w-full">
                {source.languages.slice(0, 2).map(formatLanguageLabel).join(', ')}
              </span>
            )}
          </div>
        </div>
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
          Top {visible.length} of {sources.length} category-matched {sources.length === 1 ? 'site' : 'sites'} · fastest sites first
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:gap-2.5">
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
          <span className="search-sources-expand-btn-inner justify-center text-center">
            <span className="font-display text-base sm:text-lg font-bold text-white group-hover:text-[#e8b86d] transition-colors">
              {expanded ? 'Show fewer sites' : `Load ${remaining} more sites`}
            </span>
            <span className="text-xs text-white/45 mt-1 block">
              {expanded ? 'Collapse to top 15' : `See all ${sources.length} available sources`}
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
      className="search-result-detail-card search-hero-card relative w-full max-w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-xl"
    >
      {result.backdrop && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl scale-110 pointer-events-none hidden sm:block"
          style={{ backgroundImage: `url(${result.backdrop})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c12]/96 via-[#0d1018]/94 to-[#080a10]/96 pointer-events-none" />

      <div className="relative z-10 p-3 sm:p-6 lg:p-8">
        {/* Mobile: compact rectangle header (poster + title) */}
        <div className="search-result-mobile-head md:hidden">
          <div className="search-result-poster shrink-0 rounded-lg overflow-hidden border border-white/15 bg-black/50">
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
          <div className="search-result-mobile-head-text min-w-0 flex-1">
            <div className="flex flex-wrap gap-1 mb-1.5">
              {result.category && (
                <span className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-white/5 text-white/55 border border-white/10 capitalize">
                  {result.category.replace('-', ' ')}
                </span>
              )}
              <span className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#e8b86d]/10 text-[#e8b86d] border border-[#e8b86d]/25">
                {availableCount} {availableCount === 1 ? 'site' : 'sites'}
              </span>
              {result.rating && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8b86d] text-[#1a1208]">
                  ★ {result.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h2 className="font-display text-base font-bold text-white leading-snug line-clamp-2 mb-1">
              {result.title}
            </h2>
            {result.genres && result.genres.length > 0 && (
              <p className="text-[11px] text-white/45 line-clamp-1">
                {result.genres.slice(0, 3).join(' · ')}
                {result.year ? ` · ${result.year}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Desktop / tablet: horizontal layout */}
        <div className="hidden md:flex flex-row gap-6">
          <div className="relative w-36 lg:w-44 shrink-0">
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
              <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-lg bg-[#e8b86d] text-[#1a1208] text-xs font-black shadow-lg">
                ★ {result.rating.toFixed(1)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {result.confidenceScore && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  IMDb {result.confidenceScore}%
                </span>
              )}
              {result.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-white/55 border border-white/10 capitalize">
                  {result.category.replace('-', ' ')}
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#e8b86d]/10 text-[#e8b86d] border border-[#e8b86d]/25">
                {availableCount} {availableCount === 1 ? 'site' : 'sites'}
              </span>
            </div>

            <h2 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2 leading-tight">
              {result.title}
            </h2>

            {result.originalTitle && result.originalTitle !== result.title && (
              <p className="text-xs text-white/45 mb-2 truncate">{result.originalTitle}</p>
            )}

            {result.genres && result.genres.length > 0 && (
              <p className="text-sm text-white/50 mb-3 line-clamp-2">
                {result.genres.slice(0, 4).join(' · ')}
              </p>
            )}

            {detailItems.length > 0 && (
              <div className="search-result-meta-grid grid grid-cols-3 gap-2 mb-4">
                {detailItems.map((item) => (
                  <div
                    key={item.label}
                    className="search-result-meta-item rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2"
                  >
                    <p className="text-[9px] uppercase tracking-wide text-white/35 font-semibold">{item.label}</p>
                    <p className="text-xs font-semibold text-white/80 capitalize truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {result.overview && (
              <p className="text-sm text-white/60 leading-relaxed line-clamp-4 mb-4">
                {result.overview}
              </p>
            )}

            <div className="search-result-actions flex flex-wrap items-center gap-2">
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
                  className="px-4 py-2 rounded-xl bg-[#e8b86d] text-[#1a1208] font-display font-bold text-sm hover:bg-[#f0c987] transition-colors inline-flex items-center gap-1.5"
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

        {/* Mobile: body block (details, synopsis, actions) */}
        <div className="search-result-mobile-body md:hidden">
          {detailItems.length > 0 && (
            <div className="search-result-meta-grid">
              {detailItems.map((item) => (
                <div key={item.label} className="search-result-meta-item">
                  <p className="search-result-meta-label">{item.label}</p>
                  <p className="search-result-meta-value">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {result.overview && (
            <p className="search-result-overview">{result.overview}</p>
          )}

          <div className="search-result-actions">
            {result.trailerKey && onTrailer && (
              <button
                type="button"
                onClick={() => onTrailer(result.trailerKey!)}
                className="search-result-action-btn search-result-action-secondary"
              >
                Trailer
              </button>
            )}
            {result.imdbId && (
              <a
                href={`https://www.imdb.com/title/${result.imdbId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="search-result-action-btn search-result-action-secondary"
              >
                IMDb
              </a>
            )}
            {sources[0] && (
              <button
                type="button"
                onClick={() => onVisitSource(sources[0])}
                className="search-result-action-btn search-result-action-primary"
              >
                Watch
              </button>
            )}
          </div>
        </div>

        {sources.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
            <StreamingSourcesPanel sources={sources} onVisit={onVisitSource} />
          </div>
        )}
      </div>
    </motion.article>
  );
}
