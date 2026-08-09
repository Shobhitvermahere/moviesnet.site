'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Website, ContentCategory } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import { WebsiteRankControl } from '@/components/admin/WebsiteRankControl';
import { WebsiteDragHandle } from '@/components/admin/WebsiteDragHandle';
import { useWebsiteReorder } from '@/hooks/use-website-reorder';
import { adminFetch } from '@/lib/admin-api';

export default function SearchOrderPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminStore();
  const [categoryFilter, setCategoryFilter] = useState<ContentCategory | 'all'>('all');

  useEffect(() => {
    if (!isAuthenticated) router.push('/adminshobhit/login');
  }, [isAuthenticated, router]);

  const { data: websites, isLoading } = useQuery<Website[]>({
    queryKey: ['admin-websites'],
    queryFn: async () => {
      const res = await adminFetch('/api/websites');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const displayed = websites
    ? categoryFilter === 'all'
      ? websites
      : websites.filter((w) => w.categories.includes(categoryFilter))
    : [];

  const {
    dragIndex,
    overIndex,
    reorderMutation,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    placeAtRank,
    getGlobalRank,
  } = useWebsiteReorder(websites);

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen py-8 px-4 overflow-hidden bg-black text-white">
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl z-0" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <Link href="/adminshobhit" className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold">
              ← Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold">Search Order</h1>
              <p className="text-sm text-gray-400">Use the grip handle to drag, or enter a rank number and click Set</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-black/50 border border-white/10">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${categoryFilter === 'all' ? 'bg-purple-600 text-white' : 'text-white/40'}`}
          >
            All ({websites?.length || 0})
          </button>
          {CATEGORIES.map((cat) => {
            const count = websites?.filter((w) => w.categories.includes(cat.slug)).length || 0;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategoryFilter(cat.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${categoryFilter === cat.slug ? 'bg-purple-600 text-white' : 'text-white/40'}`}
              >
                {cat.icon} {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {displayed.map((site, index) => (
              <motion.div
                key={site.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop(displayed, index)}
                className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl transition-all ${
                  dragIndex === index ? 'opacity-50' : ''
                } ${
                  overIndex === index && dragIndex !== index ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 bg-black/65'
                }`}
              >
                <WebsiteDragHandle
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                />
                <span className="text-xs font-mono text-white/30 w-6 shrink-0">#{getGlobalRank(site.id)}</span>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {site.logoUrl ? (
                    <img src={site.logoUrl} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <span className="text-xs font-bold">{site.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{site.name}</p>
                  <p className="text-xs text-white/40 truncate">{site.homepageUrl}</p>
                </div>
                <WebsiteRankControl
                  rank={getGlobalRank(site.id)}
                  maxRank={websites?.length || 1}
                  onApply={(rank) => placeAtRank(site.id, rank)}
                  disabled={reorderMutation.isPending}
                  compact
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
