'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { Website, ContentCategory } from '@/types';
import { CATEGORIES } from '@/lib/utils';

// --- Sleek Row-Based Website Item ---
function WebsiteRowItem({ website, index }: { website: Partial<Website>; index: number }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group relative rounded-2xl apple-glass-card spatial-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 spotlight shadow-lg"
    >
      {/* Left: Favicon + Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Favicon Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner group-hover:scale-110 group-hover:border-purple-500/40 transition-all duration-300">
          {website.logoUrl && !logoError ? (
            <img
              src={website.logoUrl}
              alt=""
              className="w-full h-full object-cover rounded-xl"
              loading="lazy"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-xl font-black text-white/30">{website.name?.charAt(0) || '?'}</span>
          )}
        </div>

        {/* Name, Domain & Description */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
              {website.name}
            </h3>

            {/* Health status dot */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              website.healthStatus === 'healthy' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
              website.healthStatus === 'degraded' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
              website.healthStatus === 'down' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-white/5 text-white/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                website.healthStatus === 'healthy' ? 'bg-emerald-400 animate-pulse' :
                website.healthStatus === 'degraded' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              {website.healthStatus || 'Active'}
            </span>
          </div>

          <p className="text-xs text-white/40 truncate max-w-xl">
            {website.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Middle: Category Pills */}
      {website.categories && website.categories.length > 0 && (
        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
          {website.categories.map((cat) => (
            <span key={cat} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 capitalize">
              {cat.replace('-', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Right: Domain Badge + Visit CTA */}
      <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
        {/* Domain name */}
        <span className="text-xs font-mono text-white/30 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
          {website.homepageUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
        </span>

        {/* Visit CTA button */}
        <a
          href={website.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 group-hover:scale-105 transition-all"
        >
          Visit Source
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

// --- Main Websites Page ---
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
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-10 xl:px-12">
      <div className="page-shell mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8b86d] mb-3 block">Federated index</span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-white">
            Indexed websites
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg">
            All configured websites indexed by MoviesNet. Parallel search runs across these verified sources.
          </p>
        </motion.div>

        {/* Category Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-1.5 mb-8 max-w-4xl mx-auto p-1.5 rounded-2xl bg-[#0d0d10]/90 border border-white/[0.08] backdrop-blur-xl"
        >
          {CATEGORIES.map((cat) => {
            const count = websites?.filter((w) => w.categories?.includes(cat.slug)).length || 0;
            return (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
              <span className="opacity-60">({count})</span>
            </button>
          )})}
        </motion.div>

        {/* Row-Based Website List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-2xl" />
            ))}
          </div>
        ) : filteredWebsites.length > 0 ? (
          <div className="space-y-3">
            {filteredWebsites.map((website, index) => (
              <WebsiteRowItem key={website.id} website={website} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl bg-[#0e0e11]/50 border border-white/[0.06]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 text-3xl">
              🌐
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No websites in this category</h2>
            <p className="text-sm text-white/40 max-w-md mx-auto mb-4">
              There are currently no configured sources in the &ldquo;{selectedCategory}&rdquo; category.
            </p>
            <button
              onClick={() => setSelectedCategory('movies')}
              className="btn-primary text-xs font-semibold px-4 py-2"
            >
              Show Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
