'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, QUALITY_COLORS, resolveMoviePoster } from '@/lib/utils';
import { formatLanguageLabel } from '@/lib/website-capabilities';
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
            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden shrink-0">
              {target.websiteLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={target.websiteLogo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-[#e8b86d]">{target.websiteName.charAt(0)}</span>
              )}
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

export function StreamingSourcesPanel({
  sources,
  title,
  onVisit,
  showAll = false,
}: {
  sources: StreamingSource[];
  title: string;
  onVisit: (source: StreamingSource) => void;
  showAll?: boolean;
}) {
  const [expanded, setExpanded] = useState(showAll);
  const visible = expanded ? sources : sources.slice(0, 10);

  if (sources.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-white">Where to watch</h3>
          <p className="text-xs text-white/45 mt-0.5">
            {sources.length} indexed {sources.length === 1 ? 'site' : 'sites'} · ranked by priority
          </p>
        </div>
        {sources.length > 10 && !showAll && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-[#e8b86d] hover:underline shrink-0"
          >
            {expanded ? 'Show less' : `All ${sources.length} sites`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {visible.map((source, idx) => (
          <button
            key={source.websiteId}
            type="button"
            onClick={() => onVisit(source)}
            className="search-source-card group text-left flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#e8b86d]/35 transition-all"
          >
            <span className="text-[10px] font-mono text-white/25 w-5 shrink-0">{idx + 1}</span>
            <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {source.websiteLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={source.websiteLogo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[#e8b86d]">{source.websiteName.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate group-hover:text-[#e8b86d] transition-colors">
                {source.websiteName}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {source.quality.slice(0, 2).map((q) => (
                  <span
                    key={q}
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                      QUALITY_COLORS[q] || 'bg-white/10 text-white/60 border-white/15'
                    )}
                  >
                    {q === '4k' ? '4K' : q.toUpperCase()}
                  </span>
                ))}
                <span className="text-[9px] text-white/40 truncate max-w-[100px]">
                  {source.languages.slice(0, 2).map(formatLanguageLabel).join(' · ')}
                </span>
              </div>
            </div>
            <span className="shrink-0 w-8 h-8 rounded-lg bg-[#e8b86d]/15 border border-[#e8b86d]/30 flex items-center justify-center text-[#e8b86d] group-hover:bg-[#e8b86d] group-hover:text-[#1a1208] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchHeroResult({
  result,
  websitesSearched,
  onVisitSource,
  onTrailer,
}: {
  result: SearchResult;
  websitesSearched: number;
  onVisitSource: (source: StreamingSource) => void;
  onTrailer?: (key: string) => void;
}) {
  const poster = result.poster || resolveMoviePoster(result.title, result.category);
  const sources = result.sources || [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="search-hero-card relative overflow-hidden rounded-2xl border border-white/10"
    >
      {result.backdrop && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${result.backdrop})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c12]/95 via-[#0d1018]/92 to-[#080a10]/95 pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="relative w-36 sm:w-44 mx-auto lg:mx-0 shrink-0">
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
              <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-lg bg-[#e8b86d] text-[#1a1208] text-xs font-black shadow-lg">
                ★ {result.rating.toFixed(1)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
              {result.confidenceScore && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  IMDb verified · {result.confidenceScore}%
                </span>
              )}
              {result.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-white/55 border border-white/10 capitalize">
                  {result.category.replace('-', ' ')}
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#e8b86d]/10 text-[#e8b86d] border border-[#e8b86d]/25">
                {websitesSearched} sites scanned
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2">
              {result.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-sm text-white/55 mb-4">
              {result.year && <span>{result.year}</span>}
              {result.runtime && (
                <>
                  <span className="text-white/20">·</span>
                  <span>{result.runtime}</span>
                </>
              )}
              {result.genres?.slice(0, 3).map((g) => (
                <span key={g} className="text-white/40">
                  {g}
                </span>
              ))}
              {result.imdbId && (
                <>
                  <span className="text-white/20">·</span>
                  <a
                    href={`https://www.imdb.com/title/${result.imdbId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e8b86d] hover:underline font-semibold"
                  >
                    IMDb
                  </a>
                </>
              )}
            </div>

            {result.overview && (
              <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mb-5 max-w-2xl mx-auto lg:mx-0">
                {result.overview}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              {result.trailerKey && onTrailer && (
                <button
                  type="button"
                  onClick={() => onTrailer(result.trailerKey!)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
                >
                  ▶ Trailer
                </button>
              )}
              {sources[0] && (
                <button
                  type="button"
                  onClick={() => onVisitSource(sources[0])}
                  className="px-5 py-2.5 rounded-xl bg-[#e8b86d] text-[#1a1208] font-display font-bold text-sm hover:bg-[#f0c987] transition-colors inline-flex items-center gap-2"
                >
                  Watch on {sources[0].websiteName}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {sources.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <StreamingSourcesPanel sources={sources} title={result.title} onVisit={onVisitSource} showAll />
          </div>
        )}
      </div>
    </motion.article>
  );
}
