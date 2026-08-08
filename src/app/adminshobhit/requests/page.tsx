'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SiteRequest } from '@/types';
import { CATEGORIES } from '@/lib/utils';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

function categoryLabel(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name || slug.replace('-', ' ');
}

export default function SiteRequestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('pending');

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/adminshobhit/login');
    }
  }, [isAuthenticated, token, router]);

  const { data: requests, isLoading } = useQuery<SiteRequest[]>({
    queryKey: ['admin-site-requests'],
    queryFn: async () => {
      const res = await fetch('/api/site-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!token,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, id }: { action: 'approve' | 'reject'; id: string }) => {
      const res = await fetch('/api/site-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, id }),
      });
      if (!res.ok) throw new Error('Action failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-websites'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/site-requests?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-requests'] });
    },
  });

  const filtered = requests
    ? statusFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === statusFilter)
    : [];

  const pendingCount = requests?.filter((r) => r.status === 'pending').length || 0;

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
        <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <Link
              href="/adminshobhit"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold text-gray-200 hover:text-white transition-all"
            >
              ← Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Site Requests</h1>
              <p className="text-sm text-gray-400 mt-1">
                {pendingCount} pending submission{pendingCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-black/50 border border-white/10 w-fit">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => {
            const count =
              status === 'all'
                ? requests?.length || 0
                : requests?.filter((r) => r.status === status).length || 0;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 skeleton rounded-2xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="p-5 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{req.siteName}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${
                          req.status === 'pending'
                            ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                            : req.status === 'approved'
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-red-500/20 border-red-500/30 text-red-300'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300">
                        {categoryLabel(req.category)}
                      </span>
                    </div>
                    <a
                      href={req.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-300 hover:text-purple-200 truncate block"
                    >
                      {req.siteUrl}
                    </a>
                    {req.notes && (
                      <p className="text-sm text-gray-400 mt-2">{req.notes}</p>
                    )}
                    <p className="text-xs text-white/30 mt-2">
                      Submitted {new Date(req.createdAt).toLocaleString()}
                      {req.reviewedAt && ` · Reviewed ${new Date(req.reviewedAt).toLocaleString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {req.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Approve "${req.siteName}" and add to directory?`)) {
                              actionMutation.mutate({ action: 'approve', id: req.id });
                            }
                          }}
                          disabled={actionMutation.isPending}
                          className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-sm font-semibold transition-all disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Reject request for "${req.siteName}"?`)) {
                              actionMutation.mutate({ action: 'reject', id: req.id });
                            }
                          }}
                          disabled={actionMutation.isPending}
                          className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-sm font-semibold transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this request permanently?')) {
                          deleteMutation.mutate(req.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                      title="Delete"
                      aria-label="Delete request"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📬</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mb-3">No requests found</h2>
            <p className="text-sm font-medium text-gray-300">
              {statusFilter === 'pending'
                ? 'No pending site submissions right now.'
                : `No ${statusFilter} requests.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
