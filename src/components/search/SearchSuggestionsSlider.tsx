'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SearchSuggestionItem {
  title: string;
  year: number | null;
  category: string;
  poster: string | null;
}

interface SearchSuggestionsSliderProps {
  suggestions: SearchSuggestionItem[];
  onSelect: (item: SearchSuggestionItem) => void;
  variant?: 'home' | 'search';
  /** inline = in document flow (pushes content below); overlay = floats on top */
  layout?: 'inline' | 'overlay';
  className?: string;
}

export function SearchSuggestionsSlider({
  suggestions,
  onSelect,
  variant = 'search',
  layout = 'inline',
  className,
}: SearchSuggestionsSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth',
    });
  };

  const isHome = variant === 'home';
  const isInline = layout === 'inline';

  return (
    <motion.div
      layout
      initial={isInline ? { opacity: 0, height: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
      animate={isInline ? { opacity: 1, height: 'auto' } : { opacity: 1, y: 0, scale: 1 }}
      exit={isInline ? { opacity: 0, height: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'search-suggestions-panel rounded-2xl overflow-hidden w-full',
        isInline ? 'relative mt-3 shadow-2xl' : 'absolute left-0 right-0 top-full mt-3 z-[60]',
        isHome
          ? 'home-panel search-suggestions-front border p-3'
          : 'bg-[#0e1020]/98 backdrop-blur-2xl border border-purple-500/30 p-3 shadow-2xl',
        className
      )}
      role="listbox"
      aria-label="Search suggestions"
    >
      <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
        <p
          className={cn(
            'text-[10px] sm:text-[11px] font-black uppercase tracking-wider',
            isHome ? 'text-white/45' : 'text-purple-400'
          )}
        >
          {isHome ? 'Suggested titles' : 'IMDb / TMDB suggestions'}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Scroll suggestions left"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Scroll suggestions right"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-0.5"
      >
        {suggestions.map((item, idx) => (
          <button
            key={`${item.title}-${idx}`}
            type="button"
            role="option"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
            className={cn(
              'snap-start shrink-0 w-[148px] sm:w-[160px] rounded-xl border text-left transition-all group',
              isHome
                ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#e8b86d]/40'
                : 'border-white/10 bg-white/[0.04] hover:bg-purple-500/15 hover:border-purple-500/40'
            )}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl bg-black/50">
              {item.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.poster}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-purple-300">
                  IMDb
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
              {item.year && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white/80">{item.year}</span>
              )}
            </div>
            <div className="p-2">
              <p className="text-[11px] sm:text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                {item.title}
              </p>
              {item.category && (
                <p className="text-[9px] font-semibold text-white/45 mt-1 capitalize truncate">{item.category}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
