'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DashboardStats } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAdminStore();

  useEffect(() => {
    if (!isAuthenticated || !token) router.push('/adminshobhit/login');
  }, [isAuthenticated, token, router]);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-analytics-detail'],
    queryFn: async () => {
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!token,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen py-8 px-4 overflow-hidden bg-black text-white">
      {/* Background Aurora Orbs & Blur */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl z-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl">
          <Link href="/adminshobhit" className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold text-gray-200 hover:text-white transition-all">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics Overview</h1>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Searches', value: stats?.totalSearches, icon: '🔍', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
            { label: 'Total Clicks', value: stats?.totalClicks, icon: '👆', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
            { label: 'Failed Searches', value: stats?.failedSearches, icon: '❌', color: 'from-pink-500/20 to-pink-600/10 border-pink-500/30' },
            { label: 'Avg Search Time', value: stats?.avgSearchTime ? `${stats.avgSearchTime}ms` : '0ms', icon: '⚡', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border backdrop-blur-2xl bg-black/65 shadow-xl hover:border-white/40 transition-all hover:-translate-y-1`}
            >
              <span className="text-2xl mb-3 block">{stat.icon}</span>
              <p className="text-3xl font-extrabold text-white mb-1">
                {isLoading ? <span className="skeleton inline-block w-20 h-8 rounded-lg" /> : (
                  typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value || '0'
                )}
              </p>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Searches */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl"
          >
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">Top Searches</h2>
            {isLoading ? (
              <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-9 skeleton rounded-xl" />)}</div>
            ) : stats?.topSearches && stats.topSearches.length > 0 ? (
              <div className="space-y-2.5">
                {stats.topSearches.map((item, i) => {
                  const maxCount = Math.max(...stats.topSearches.map((s) => s.count), 1);
                  return (
                    <div key={item.query} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                      <div
                        className="absolute inset-y-0 left-0 bg-purple-600/20"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                      <div className="relative flex items-center gap-3 p-3 z-10">
                        <span className="text-xs font-bold text-purple-400 w-6 text-center font-mono">{i + 1}</span>
                        <span className="text-sm font-semibold text-white flex-1 truncate">{item.query}</span>
                        <span className="text-xs font-bold text-gray-200 font-mono px-2 py-1 rounded bg-black/40 border border-white/10">{formatNumber(item.count)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 text-center py-10">No search data recorded yet</p>
            )}
          </motion.div>

          {/* Top Websites */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl"
          >
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">Top Websites (by clicks)</h2>
            {isLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-9 skeleton rounded-xl" />)}</div>
            ) : stats?.topWebsites && stats.topWebsites.length > 0 ? (
              <div className="space-y-2.5">
                {stats.topWebsites.map((item, i) => {
                  const maxClicks = Math.max(...stats.topWebsites.map((w) => w.clicks), 1);
                  return (
                    <div key={item.name} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                      <div
                        className="absolute inset-y-0 left-0 bg-blue-600/20"
                        style={{ width: `${(item.clicks / maxClicks) * 100}%` }}
                      />
                      <div className="relative flex items-center gap-3 p-3 z-10">
                        <span className="text-xs font-bold text-blue-400 w-6 text-center font-mono">{i + 1}</span>
                        <span className="text-sm font-semibold text-white flex-1 truncate">{item.name}</span>
                        <span className="text-xs font-bold text-gray-200 font-mono px-2 py-1 rounded bg-black/40 border border-white/10">{formatNumber(item.clicks)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 text-center py-10">No click data recorded yet</p>
            )}
          </motion.div>

          {/* Search Volume Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl lg:col-span-2"
          >
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">Search Volume (Last 7 Days)</h2>
            {isLoading ? (
              <div className="h-52 skeleton rounded-xl" />
            ) : stats?.searchesOverTime ? (
              <div className="flex items-end gap-3 h-52 pt-4 px-2">
                {stats.searchesOverTime.map((day) => {
                  const maxCount = Math.max(...stats.searchesOverTime.map((d) => d.count), 1);
                  const height = Math.max((day.count / maxCount) * 100, 6);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-purple-300 font-mono">{day.count}</span>
                      <div className="w-full rounded-t-xl bg-gradient-to-t from-purple-600 via-indigo-500 to-blue-400 transition-all duration-500 shadow-md shadow-purple-500/20 hover:brightness-125" style={{ height: `${height}%` }} />
                      <span className="text-xs font-semibold text-gray-300 font-mono">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 text-center py-12">No data available</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
