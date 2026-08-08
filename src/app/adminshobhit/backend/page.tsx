'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FmhySource } from '@/types';

type BackendResponse = {
  sources: FmhySource[];
  total: number;
  publishedCount: number;
  sections: string[];
};

export default function BackendPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAdminStore();
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/adminshobhit/login');
    }
  }, [isAuthenticated, token, router]);

  const { data, isLoading } = useQuery<BackendResponse>({
    queryKey: ['admin-fmhy-sources', sectionFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sectionFilter !== 'all') params.set('section', sectionFilter);
      if (statusFilter === 'published') params.set('published', 'true');
      if (statusFilter === 'unpublished') params.set('published', 'false');
      const res = await fetch(`/api/fmhy-sources?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!token,
  });

  const actionMutation = useMutation({
    mutationFn: async (payload: { action: string; id?: string }) => {
      const res = await fetch('/api/fmhy-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Action failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fmhy-sources'] });
      queryClient.invalidateQueries({ queryKey: ['admin-websites'] });
    },
  });

  const filtered = useMemo(() => {
    if (!data?.sources) return [];
    if (!search.trim()) return data.sources;
    const q = search.toLowerCase();
    return data.sources.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q)
    );
  }, [data?.sources, search]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen py-8 px-4 overflow-hidden bg-black text-white">
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl z-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <Link
              href="/adminshobhit"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold text-gray-200 hover:text-white transition-all"
            >
              ← Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Backend — FMHY Catalog</h1>
              <p className="text-sm text-gray-400 mt-1">
                {data?.total || 0} sources from{' '}
                <a href="https://fmhy.net/video" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  fmhy.net/video
                </a>
                {' · '}Backend only — not shown on the public site unless you publish
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => actionMutation.mutate({ action: 'refresh' })}
              disabled={actionMutation.isPending}
              className="px-4 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-sm font-semibold hover:bg-cyan-600/30 disabled:opacity-50"
            >
              Sync from FMHY
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Publish all unpublished FMHY sources to the live site directory?')) {
                  actionMutation.mutate({ action: 'publish-all' });
                }
              }}
              disabled={actionMutation.isPending}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-600/30 disabled:opacity-50"
            >
              Publish All to Directory
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FMHY sources…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder:text-white/30"
          />
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white"
          >
            <option value="all">All sections</option>
            {data?.sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.01, 0.3) }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-black/65 border border-white/10 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{source.name}</h3>
                    {source.featured && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Featured
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        source.published
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-white/40 border-white/10'
                      }`}
                    >
                      {source.published ? 'Live' : 'Backend only'}
                    </span>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400/80 hover:text-cyan-300 truncate block"
                  >
                    {source.url}
                  </a>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50">{source.section}</span>
                    {source.categories.map((cat) => (
                      <span key={cat} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 capitalize">
                        {cat.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                {!source.published && (
                  <button
                    type="button"
                    onClick={() => actionMutation.mutate({ action: 'publish', id: source.id })}
                    disabled={actionMutation.isPending}
                    className="px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 disabled:opacity-50 flex-shrink-0"
                  >
                    Publish
                  </button>
                )}
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-16">No sources match your filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
