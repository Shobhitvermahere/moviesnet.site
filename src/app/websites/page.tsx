'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { Website, ContentCategory } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import { WebsiteLogo } from '@/components/WebsiteLogo';

function WebsiteRowItem({ website, index }: { website: Partial<Website>; index: number }) {
  const domain = website.homepageUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="group rounded-2xl border border-white/[0.08] bg-[#0a0d14]/60 p-4 sm:p-5 shadow-lg min-w-0"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden p-1.5">
          {website.homepageUrl && website.name ? (
            <WebsiteLogo
              homepageUrl={website.homepageUrl}
              logoUrl={website.logoUrl}
              name={website.name}
              imgClassName="w-full h-full"
            />
          ) : (
            <span className="text-lg font-black text-white/30">{website.name?.charAt(0) || '?'}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#e8b86d] transition-colors truncate max-w-full">
              {website.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                website.healthStatus === 'healthy'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : website.healthStatus === 'degraded'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : website.healthStatus === 'down'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      : 'bg-white/5 text-white/30 border border-white/10'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  website.healthStatus === 'healthy'
                    ? 'bg-emerald-400'
                    : website.healthStatus === 'degraded'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                }`}
              />
              {website.healthStatus || 'Active'}
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-white/40 font-mono truncate">{domain}</p>
          <p className="mt-2 text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-2">
            {website.description || 'No description provided.'}
          </p>

          {website.categories && website.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {website.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#e8b86d]/10 border border-[#e8b86d]/20 text-[#e8b86d] capitalize"
                >
                  {cat.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 min-[420px]:grid-cols-[1fr_auto] gap-2">
        <span className="text-[11px] font-mono text-white/35 px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] truncate self-center">
          {domain}
        </span>
        <a
          href={website.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs font-bold px-4 py-2.5 min-h-[2.75rem] rounded-xl shadow-md flex items-center justify-center gap-1.5"
        >
          Visit Source
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </motion.article>
  );
}

export default function WebsitesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>('movies');

  const { data: websites, isLoading } = useQuery<Partial<Website>[]>({
    queryKey: ['websites'],
    queryFn: async () => {
      const res = await fetch('/api/websites');
      return res.json();
    },
  });

  const filteredWebsites = websites
    ? websites.filter((site) => site.categories?.includes(selectedCategory))
    : [];

  return (
    <div className="min-h-screen py-8 sm:py-16 page-gutter">
      <div className="page-shell mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8b86d] mb-3 block">
            Federated index
          </span>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight text-white">
            Indexed websites
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-sm sm:text-lg px-1">
            All configured websites indexed by MoviesNet. Parallel search runs across these verified sources.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="websites-filter-rail mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-[#0d0d10]/90 border border-white/[0.08] backdrop-blur-xl max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => {
              const count = websites?.filter((w) => w.categories?.includes(cat.slug)).length || 0;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`shrink-0 px-3 py-2.5 min-h-[2.75rem] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.slug
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="whitespace-nowrap">{cat.name}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 sm:h-24 skeleton rounded-2xl" />
            ))}
          </div>
        ) : filteredWebsites.length > 0 ? (
          <div className="space-y-3">
            {filteredWebsites.map((website, index) => (
              <WebsiteRowItem key={website.id} website={website} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 rounded-3xl bg-[#0e0e11]/50 border border-white/[0.06] px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl">
              🌐
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">No websites in this category</h2>
            <p className="text-sm text-white/40 max-w-md mx-auto mb-4">
              There are currently no configured sources in the &ldquo;{selectedCategory}&rdquo; category.
            </p>
            <button
              onClick={() => setSelectedCategory('movies')}
              className="btn-primary text-xs font-semibold px-4 py-2.5 min-h-[2.75rem]"
            >
              Show Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
