'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { TrendingItem } from '@/types';

type Period = 'today' | 'week' | 'month';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
};

// Demo trending data for when search history is empty
const DEMO_TRENDING: Record<Period, TrendingItem[]> = {
  today: [
    { query: 'One Piece', count: 2847, category: 'anime', trend: 'up', changePercent: 15 },
    { query: 'Demon Slayer Season 4', count: 2103, category: 'anime', trend: 'up', changePercent: 42 },
    { query: 'Oppenheimer', count: 1892, category: 'movies', trend: 'stable', changePercent: 2 },
    { query: 'Breaking Bad', count: 1654, category: 'tv-shows', trend: 'down', changePercent: 8 },
    { query: 'Jujutsu Kaisen', count: 1432, category: 'anime', trend: 'up', changePercent: 23 },
    { query: 'Stranger Things', count: 1298, category: 'tv-shows', trend: 'stable', changePercent: 1 },
    { query: 'Dune Part Two', count: 1156, category: 'movies', trend: 'up', changePercent: 67 },
    { query: 'Attack on Titan', count: 1023, category: 'anime', trend: 'down', changePercent: 12 },
    { query: 'The Bear', count: 987, category: 'tv-shows', trend: 'up', changePercent: 34 },
    { query: 'Spider-Man', count: 876, category: 'movies', trend: 'stable', changePercent: 5 },
  ],
  week: [
    { query: 'One Piece', count: 18432, category: 'anime', trend: 'up', changePercent: 12 },
    { query: 'Naruto Shippuden', count: 15234, category: 'anime', trend: 'stable', changePercent: 3 },
    { query: 'Oppenheimer', count: 12876, category: 'movies', trend: 'up', changePercent: 28 },
    { query: 'Demon Slayer', count: 11543, category: 'anime', trend: 'up', changePercent: 18 },
    { query: 'Breaking Bad', count: 9876, category: 'tv-shows', trend: 'stable', changePercent: 2 },
    { query: 'Squid Game', count: 8765, category: 'tv-shows', trend: 'down', changePercent: 15 },
    { query: 'Avatar', count: 7654, category: 'movies', trend: 'down', changePercent: 8 },
    { query: 'My Hero Academia', count: 6543, category: 'anime', trend: 'up', changePercent: 22 },
  ],
  month: [
    { query: 'One Piece', count: 67432, category: 'anime', trend: 'up', changePercent: 8 },
    { query: 'Naruto', count: 54321, category: 'anime', trend: 'stable', changePercent: 1 },
    { query: 'Breaking Bad', count: 43210, category: 'tv-shows', trend: 'up', changePercent: 5 },
    { query: 'Oppenheimer', count: 38765, category: 'movies', trend: 'up', changePercent: 45 },
    { query: 'Demon Slayer', count: 32456, category: 'anime', trend: 'up', changePercent: 12 },
    { query: 'Stranger Things', count: 28765, category: 'tv-shows', trend: 'down', changePercent: 10 },
  ],
};

export default function TrendingPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('today');

  const { data } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await fetch('/api/trending');
      return res.json();
    },
  });

  const trendingData = data && data[activePeriod]?.length > 0
    ? data[activePeriod]
    : DEMO_TRENDING[activePeriod];

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-10 xl:px-12">
      <div className="page-shell mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8b86d] mb-3 block">Live telemetry</span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-white">
            Trending content
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg">
            Discover the most searched titles across all configured websites in real time.
          </p>
        </motion.div>

        {/* Period Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center gap-2 mb-10 p-1.5 rounded-2xl bg-[#0d0d10] border border-white/[0.08] max-w-md mx-auto"
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activePeriod === period
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {PERIOD_LABELS[period]}
            </button>
          ))}
        </motion.div>

        {/* Trending List */}
        <div className="space-y-3">
          {trendingData.map((item: TrendingItem, index: number) => (
            <motion.div
              key={item.query}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                href={`/search?q=${encodeURIComponent(item.query)}`}
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-[#0e0e11]/80 backdrop-blur-xl border border-white/[0.07] hover:border-purple-500/30 hover:bg-[#121217] transition-all duration-300 shadow-md hover:shadow-xl"
              >
                {/* Rank Badge */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  index === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10' :
                  index === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                  index === 2 ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30' :
                  'bg-white/[0.03] text-white/30 border border-white/[0.05]'
                }`}>
                  #{index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {item.query}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {item.category && (
                      <span className="text-[11px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full capitalize font-medium">
                        {item.category.replace('-', ' ')}
                      </span>
                    )}
                    <span className="text-xs text-white/30 font-mono">
                      {item.count.toLocaleString()} searches
                    </span>
                  </div>
                </div>

                {/* Trend percentage chip */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  item.trend === 'up' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                  item.trend === 'down' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 
                  'bg-white/[0.03] text-white/30 border-white/[0.05]'
                }`}>
                  {item.trend === 'up' && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  )}
                  {item.trend === 'down' && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                  {item.changePercent > 0 ? `+${item.changePercent}%` : 'Stable'}
                </div>

                {/* Arrow */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-all">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
