'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import type { DirectoryTrendingPick } from '@/lib/trending-showcase';

async function fetchDirectoryTrending(): Promise<{
  picks: DirectoryTrendingPick[];
  totalSites: number;
}> {
  const res = await fetch('/api/trending/directory');
  if (!res.ok) throw new Error('Failed to load trending picks');
  return res.json();
}

export function SearchTrendingPicks({ onSelect }: { onSelect: (title: string) => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-trending-picks'],
    queryFn: fetchDirectoryTrending,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="h-6 w-48 rounded bg-white/5 animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-white/[0.04] animate-pulse border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.picks?.length) return null;

  return (
    <div className="mt-8 text-left">
      <div className="mb-5">
        <h3 className="font-display text-lg sm:text-xl font-bold text-white">Trending on your sites</h3>
        <p className="text-sm text-white/45 mt-1">
          Popular titles across {data.totalSites} indexed {data.totalSites === 1 ? 'site' : 'sites'} — tap to search everywhere.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {data.picks.map((item, idx) => (
          <motion.button
            key={`${item.title}-${idx}`}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.32) }}
            onClick={() => onSelect(item.title)}
            className="search-hero-card group text-left rounded-xl border border-white/10 overflow-hidden hover:border-[#e8b86d]/35 transition-colors"
          >
            <div className="relative aspect-[2/3] overflow-hidden bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-transparent to-transparent" />
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8b86d] text-[#1a1208]">
                ★ {item.rating}
              </span>
              <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white/80 border border-white/10 capitalize">
                {item.category}
              </span>
            </div>

            <div className="p-3">
              <h4 className="font-display text-sm font-semibold text-white line-clamp-2 group-hover:text-[#e8b86d] transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-white/40 mt-0.5">{item.year}</p>

              {item.featuredSites.length > 0 && (
                <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                  {item.featuredSites.map((site) => (
                    <span
                      key={site.id}
                      className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-white/55"
                      title={site.name}
                    >
                      {site.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={site.logoUrl} alt="" className="w-3 h-3 rounded object-cover" />
                      ) : (
                        <span className="w-3 h-3 rounded bg-[#e8b86d]/20 text-[#e8b86d] flex items-center justify-center text-[8px]">
                          {site.name.charAt(0)}
                        </span>
                      )}
                      <span className="max-w-[72px] truncate">{site.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
