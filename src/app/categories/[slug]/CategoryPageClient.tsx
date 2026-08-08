'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/utils';
import type { ContentCategory } from '@/types';

interface CategoryInfo {
  slug: ContentCategory;
  name: string;
  description: string;
  icon: string;
  gradient: string;
}

export default function CategoryPageClient({ category }: { category: CategoryInfo }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&category=${category.slug}`);
      }
    },
    [searchQuery, router, category.slug]
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-5xl mb-4 block">{category.icon}</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">{category.name}</span>
          </h1>
          <p className="text-white/40 max-w-lg mx-auto mb-8">
            {category.description}. Search across all indexed websites.
          </p>

          {/* Search bar for this category */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${category.name.toLowerCase()}...`}
              className="search-input"
              aria-label={`Search ${category.name}`}
            />
          </form>
        </motion.div>

        {/* Quick links to other categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-sm font-semibold text-white/25 uppercase tracking-wider text-center mb-4">
            Other Categories
          </h2>
          <div className="flex flex-wrap gap-2.5 justify-center p-1.5 rounded-full bg-[#050714]/80 border border-white/10 backdrop-blur-xl max-w-fit mx-auto">
            {CATEGORIES.filter((c) => c.slug !== category.slug).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white hover:bg-white/[0.1] transition-all duration-300 active:scale-95"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Content area — shows when search is done or browse mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">{category.icon}</span>
          </div>
          <h2 className="text-xl font-semibold text-white/50 mb-3">
            Search {category.name}
          </h2>
          <p className="text-sm text-white/25 max-w-md mx-auto mb-6">
            Use the search bar above to find {category.name.toLowerCase()} across all configured websites,
            or browse trending {category.name.toLowerCase()} on the{' '}
            <Link href="/trending" className="text-purple-400/60 hover:text-purple-400 underline underline-offset-2">
              trending page
            </Link>.
          </p>
          <Link
            href={`/search?category=${category.slug}`}
            className="btn-primary"
          >
            Browse All {category.name}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
