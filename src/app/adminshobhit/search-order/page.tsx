'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Website, ContentCategory } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import { moveWebsiteToRank } from '@/lib/website-reorder';
import { WebsiteRankControl } from '@/components/admin/WebsiteRankControl';

export default function SearchOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAdminStore();
  const [categoryFilter, setCategoryFilter] = useState<ContentCategory | 'all'>('all');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) router.push('/adminshobhit/login');
  }, [isAuthenticated, token, router]);

  const { data: websites, isLoading } = useQuery<Website[]>({
    queryKey: ['admin-websites'],
    queryFn: async () => {
      const res = await fetch('/api/websites', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!token,
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch('/api/websites/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-websites'] }),
  });

  const displayed = websites
    ? categoryFilter === 'all'
      ? websites
      : websites.filter((w) => w.categories.includes(categoryFilter))
    : [];

  const mergeReorder = (fromIndex: number, toIndex: number) => {
    if (!websites || fromIndex === toIndex) return;
    const allIds = websites.map((w) => w.id);
    const filteredIds = displayed.map((w) => w.id);
    const filterPositions: number[] = [];
    const filterIdOrder: string[] = [];
    allIds.forEach((id, i) => {
      if (filteredIds.includes(id)) {
        filterPositions.push(i);
        filterIdOrder.push(id);
      }
    });
    const newOrder = [...filterIdOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    const result = [...allIds];
    filterPositions.forEach((pos, i) => {
      result[pos] = newOrder[i];
    });
    reorderMutation.mutate(result);
  };

  const placeAtRank = (siteId: string, targetRank: number) => {
    if (!websites) return;
    const allIds = websites.map((w) => w.id);
    reorderMutation.mutate(moveWebsiteToRank(allIds, siteId, targetRank));
  };

  const getGlobalRank = (siteId: string) => {
    if (!websites) return 1;
    const index = websites.findIndex((w) => w.id === siteId);
    return index === -1 ? 1 : index + 1;
  };

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
              <p className="text-sm text-gray-400">Drag or enter a rank to set which websites appear first in search</p>
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
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => { e.preventDefault(); setOverIndex(index); }}
                onDrop={() => { if (dragIndex !== null) mergeReorder(dragIndex, index); setDragIndex(null); setOverIndex(null); }}
                onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-xl cursor-grab active:cursor-grabbing transition-all ${
                  overIndex === index && dragIndex !== index ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 bg-black/65'
                }`}
              >
                <span className="text-xs font-mono text-white/30 w-6">{getGlobalRank(site.id)}</span>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {site.logoUrl ? <img src={site.logoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{site.name.charAt(0)}</span>}
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
