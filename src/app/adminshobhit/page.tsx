'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DashboardStats } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, token, logout } = useAdminStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/adminshobhit/login');
    }
  }, [isAuthenticated, token, router]);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 30000,
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
        <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-[#e8b86d] bg-clip-text text-transparent">
                welcome back shobhit
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm font-medium text-gray-300"
            >
              MoviesNet admin dashboard
            </motion.p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/adminshobhit/websites" className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Manage Websites
            </Link>
            <Link href="/adminshobhit/requests" className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 border border-amber-400/40 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Site Requests
            </Link>
            <Link href="/adminshobhit/backend" className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400/40 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              Backend
            </Link>
            <button onClick={() => { logout(); router.push('/adminshobhit/login'); }} className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm font-semibold transition-all hover:scale-[1.02]">
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Searches', value: stats?.totalSearches || 0, icon: '🔍', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
            { label: 'Total Clicks', value: stats?.totalClicks || 0, icon: '👆', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
            { label: 'Total Websites', value: stats?.totalWebsites || 0, icon: '🌐', color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30' },
            { label: 'Active Websites', value: stats?.activeWebsites || 0, icon: '✅', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border backdrop-blur-2xl bg-black/65 shadow-xl hover:border-white/40 transition-all hover:-translate-y-1`}
            >
              <span className="text-2xl mb-3 block">{stat.icon}</span>
              <p className="text-3xl font-extrabold text-white mb-1">
                {isLoading ? <span className="skeleton inline-block w-20 h-8 rounded-lg" /> : formatNumber(stat.value)}
              </p>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl"
          >
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Health
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: 'Status',
                  value: stats?.systemHealth?.status || 'unknown',
                  status: stats?.systemHealth?.status === 'healthy' ? 'emerald' : stats?.systemHealth?.status === 'degraded' ? 'yellow' : 'red',
                },
                {
                  label: 'Uptime',
                  value: stats?.systemHealth?.uptime ? `${Math.floor(stats.systemHealth.uptime / 3600)}h ${Math.floor((stats.systemHealth.uptime % 3600) / 60)}m` : '-',
                },
                {
                  label: 'Memory Usage',
                  value: stats?.systemHealth?.memoryUsage ? `${Math.round(stats.systemHealth.memoryUsage)}MB` : '-',
                },
                {
                  label: 'Cache Hit Rate',
                  value: stats?.systemHealth?.cacheHitRate !== undefined ? `${(stats.systemHealth.cacheHitRate * 100).toFixed(1)}%` : '-',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.05] border border-white/10">
                  <span className="text-sm font-semibold text-gray-200">{item.label}</span>
                  <span className={`text-sm font-bold ${
                    'status' in item && item.status
                      ? item.status === 'emerald' ? 'text-emerald-400' : item.status === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {isLoading ? <span className="skeleton inline-block w-16 h-4 rounded" /> : (
                      <span className="flex items-center gap-2">
                        {'status' in item && item.status && (
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            item.status === 'emerald' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' :
                            item.status === 'yellow' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                          }`} />
                        )}
                        <span className="capitalize">{item.value}</span>
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Searches */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl"
          >
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">Top Searches</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-9 skeleton rounded-xl" />)}
              </div>
            ) : stats?.topSearches && stats.topSearches.length > 0 ? (
              <div className="space-y-2.5">
                {stats.topSearches.map((item, i) => (
                  <div key={item.query} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold text-purple-400 w-6 text-center font-mono">{i + 1}</span>
                    <span className="text-sm font-semibold text-white flex-1 truncate">{item.query}</span>
                    <span className="text-xs font-bold text-gray-300 font-mono px-2 py-1 rounded bg-black/40 border border-white/10">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 text-center py-10">No search data recorded yet</p>
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
              <div className="h-44 skeleton rounded-xl" />
            ) : stats?.searchesOverTime ? (
              <div className="flex items-end gap-3 h-44 pt-4 px-2">
                {stats.searchesOverTime.map((day) => {
                  const maxCount = Math.max(...stats.searchesOverTime.map((d) => d.count), 1);
                  const height = Math.max((day.count / maxCount) * 100, 6);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-purple-300 font-mono">{day.count}</span>
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-purple-600 via-indigo-500 to-blue-400 transition-all duration-500 shadow-md shadow-purple-500/20"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs font-semibold text-gray-300 font-mono">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 text-center py-10">No data available</p>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link href="/adminshobhit/websites" className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl hover:border-purple-500/50 hover:bg-black/80 transition-all group">
            <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-1">Manage Websites</h3>
            <p className="text-xs font-medium text-gray-300">Add, edit, drag-reorder, or remove sites</p>
          </Link>
          <Link href="/adminshobhit/requests" className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl hover:border-amber-500/50 hover:bg-black/80 transition-all group">
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-1">Site Requests</h3>
            <p className="text-xs font-medium text-gray-300">Review community submissions to add new sites</p>
          </Link>
          <Link href="/adminshobhit/backend" className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl hover:border-cyan-500/50 hover:bg-black/80 transition-all group">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">Backend (FMHY)</h3>
            <p className="text-xs font-medium text-gray-300">640+ streaming sites from fmhy.net/video catalog</p>
          </Link>
          <Link href="/adminshobhit/search-order" className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl hover:border-emerald-500/50 hover:bg-black/80 transition-all group">
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">Search Order</h3>
            <p className="text-xs font-medium text-gray-300">Drag to control which sites appear first in search</p>
          </Link>
          <Link href="/adminshobhit/analytics" className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl hover:border-blue-500/50 hover:bg-black/80 transition-all group">
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1">Analytics</h3>
            <p className="text-xs font-medium text-gray-300">View detailed search and click analytics</p>
          </Link>
          <a href="/api/health" target="_blank" rel="noopener noreferrer" className="p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl hover:border-cyan-500/50 hover:bg-black/80 transition-all group">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">Health Check</h3>
            <p className="text-xs font-medium text-gray-300">View system health and status</p>
          </a>
        </div>
      </div>
    </div>
  );
}
