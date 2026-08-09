'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Website, ParserType, ContentCategory, Language } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import { WebsiteRankControl } from '@/components/admin/WebsiteRankControl';
import { adminFetch } from '@/lib/admin-api';
import { WebsiteDragHandle } from '@/components/admin/WebsiteDragHandle';
import { useWebsiteReorder } from '@/hooks/use-website-reorder';

const EMPTY_PARSER_CONFIG = {
  type: 'css' as ParserType,
  searchUrlTemplate: '',
  resultSelector: '',
  titleSelector: '',
  posterSelector: '',
  linkSelector: '',
  qualitySelector: '',
  languageSelector: '',
  subtitleSelector: '',
  episodeSelector: '',
  seasonSelector: '',
  statusSelector: '',
  genreSelector: '',
  ratingSelector: '',
  yearSelector: '',
  runtimeSelector: '',
  lastUpdatedSelector: '',
  paginationSelector: '',
  apiEndpoint: '',
  apiMethod: 'GET' as const,
  apiHeaders: {},
  apiBodyTemplate: '',
  responseMapping: {},
};

const DEFAULT_WEBSITE: Partial<Website> = {
  name: '',
  slug: '',
  description: '',
  homepageUrl: '',
  searchUrl: '',
  logoUrl: '',
  categories: [],
  languages: [],
  country: '',
  priority: 0,
  enabled: true,
  rateLimit: 30,
  timeout: 10000,
  retryCount: 2,
  headers: {},
  cookies: '',
  userAgent: 'MoviesNet/1.0',
  parserConfig: EMPTY_PARSER_CONFIG,
  healthStatus: 'unknown',
  totalIndexed: 0,
  averageUpdateFrequency: 'daily',
  popularity: 0,
};

export default function WebsiteManagerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, logout } = useAdminStore();
  const [editingWebsite, setEditingWebsite] = useState<Partial<Website> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ContentCategory | 'all'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/adminshobhit/login');
    }
  }, [isAuthenticated, router]);

  // Fetch websites
  const { data: websites, isLoading } = useQuery<Website[]>({
    queryKey: ['admin-websites'],
    queryFn: async () => {
      const res = await adminFetch('/api/websites');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Website>) => {
      const res = await adminFetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-websites'] });
      setIsCreating(false);
      setEditingWebsite(null);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Website>) => {
      const res = await adminFetch('/api/websites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-websites'] });
      setEditingWebsite(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/websites?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-websites'] });
    },
  });

  const displayedWebsites = websites
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

  // Toggle enabled
  const toggleEnabled = (website: Website) => {
    updateMutation.mutate({ id: website.id, enabled: !website.enabled });
  };

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
          <div className="flex items-center gap-4">
            <Link href="/adminshobhit" className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold text-gray-200 hover:text-white transition-all">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Website Manager</h1>
          </div>
          <div className="flex items-center gap-3">
          <Link
            href="/adminshobhit/search-order"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold text-gray-200 hover:text-white transition-all"
          >
            Search Order
          </Link>
          <button
            onClick={() => { setEditingWebsite({ ...DEFAULT_WEBSITE }); setIsCreating(true); }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Website
          </button>
          </div>
        </div>

        {/* Category filter + drag hint */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    categoryFilter === cat.slug
                      ? 'bg-purple-600 text-white'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat.icon}</span> {cat.name} ({count})
                </button>
              );
            })}
          </div>
          <p className="text-xs text-white/40">Use the grip handle to drag, or set rank to jump position</p>
        </div>

        {/* Website List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
          </div>
        ) : displayedWebsites.length > 0 ? (
          <div className="space-y-3">
            {displayedWebsites.map((website, index) => (
              <motion.div
                key={website.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop(displayedWebsites, index)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className={`flex items-center gap-4 p-5 rounded-2xl bg-black/65 border backdrop-blur-2xl shadow-lg transition-all ${
                  dragIndex === index ? 'opacity-50 scale-[0.98]' : ''
                } ${
                  overIndex === index && dragIndex !== index
                    ? 'border-purple-400/60 bg-purple-500/10'
                    : 'border-white/15 hover:border-purple-500/40 hover:bg-black/80'
                }`}
              >
                <WebsiteDragHandle
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                />
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                  {website.logoUrl ? (
                    <img src={website.logoUrl} alt="" draggable={false} className="w-full h-full object-cover rounded-xl pointer-events-none" />
                  ) : (
                    <span className="text-lg font-extrabold text-purple-300">{website.name.charAt(0)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-base font-bold text-white truncate">{website.name}</h3>
                    <span className={`w-2.5 h-2.5 rounded-full ${website.enabled ? 'bg-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-gray-500'}`} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                      website.healthStatus === 'healthy' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
                      website.healthStatus === 'degraded' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
                      website.healthStatus === 'down' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                      'bg-white/10 border-white/15 text-gray-300'
                    }`}>
                      {website.healthStatus}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-purple-300/90 truncate">{website.homepageUrl}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Search rank: #{getGlobalRank(website.id)}</p>
                </div>

                {/* Categories */}
                <div className="hidden md:flex gap-1.5">
                  {website.categories.slice(0, 3).map((cat) => (
                    <span key={cat} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 capitalize whitespace-nowrap">
                      {cat.replace('-', ' ')}
                    </span>
                  ))}
                </div>

                {/* Parser type */}
                <span className="hidden lg:inline text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-gray-200 font-mono uppercase">
                  {website.parserConfig.type}
                </span>

                <WebsiteRankControl
                  rank={getGlobalRank(website.id)}
                  maxRank={websites?.length || 1}
                  onApply={(rank) => placeAtRank(website.id, rank)}
                  disabled={reorderMutation.isPending}
                  compact
                />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEnabled(website)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      website.enabled 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30' 
                        : 'bg-white/10 border-white/15 text-gray-400 hover:text-white hover:bg-white/20'
                    }`}
                    title={website.enabled ? 'Disable' : 'Enable'}
                    aria-label={website.enabled ? 'Disable website' : 'Enable website'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {website.enabled ? (
                        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                      ) : (
                        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => { setEditingWebsite(website); setIsCreating(false); }}
                    className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-gray-200 hover:text-white hover:bg-white/20 transition-all"
                    title="Edit"
                    aria-label="Edit website"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${website.name}"? This cannot be undone.`)) {
                        deleteMutation.mutate(website.id);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all"
                    title="Delete"
                    aria-label="Delete website"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-3xl">🌐</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mb-3">No websites configured yet</h2>
            <p className="text-sm font-medium text-gray-300 mb-6 max-w-md mx-auto">Add your first website to enable unified searching and indexing.</p>
            <button
              onClick={() => { setEditingWebsite({ ...DEFAULT_WEBSITE }); setIsCreating(true); }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 transition-all"
            >
              Add First Website
            </button>
          </div>
        )}

        {/* Edit/Create Modal */}
        <AnimatePresence>
          {editingWebsite && (
            <WebsiteEditorModal
              website={editingWebsite}
              isCreating={isCreating}
              onSave={(data) => {
                if (isCreating) {
                  createMutation.mutate(data);
                } else {
                  updateMutation.mutate(data);
                }
              }}
              onClose={() => { setEditingWebsite(null); setIsCreating(false); }}
              isSaving={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Website Editor Modal ---
function WebsiteEditorModal({
  website,
  isCreating,
  onSave,
  onClose,
  isSaving,
}: {
  website: Partial<Website>;
  isCreating: boolean;
  onSave: (data: Partial<Website>) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Website>>(website);
  const [activeTab, setActiveTab] = useState<'general' | 'parser' | 'advanced'>('general');

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateParser = (field: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      parserConfig: { ...prev.parserConfig!, [field]: value } as Website['parserConfig'],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-generate slug from name
    if (!form.slug && form.name) {
      form.slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    onSave(form);
  };

  const LANGUAGE_ALL: { value: Language; label: string }[] = [
    { value: 'english', label: 'English' }, { value: 'hindi', label: 'Hindi' },
    { value: 'japanese', label: 'Japanese' }, { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' }, { value: 'malayalam', label: 'Malayalam' },
    { value: 'kannada', label: 'Kannada' }, { value: 'dual-audio', label: 'Dual Audio' },
    { value: 'multi-audio', label: 'Multi Audio' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#111111] border border-white/[0.08] shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/[0.05] bg-[#111111]">
            <h2 className="text-lg font-semibold">{isCreating ? 'Add Website' : 'Edit Website'}</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 pt-4">
            {(['general', 'parser', 'advanced'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-5 space-y-4">
            {activeTab === 'general' && (
              <>
                <FormField label="Website Name" required>
                  <input type="text" value={form.name || ''} onChange={(e) => updateField('name', e.target.value)} className="form-input" placeholder="My Website" required />
                </FormField>
                <FormField label="Description">
                  <textarea value={form.description || ''} onChange={(e) => updateField('description', e.target.value)} className="form-input min-h-[80px] resize-y" placeholder="Brief description..." />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Homepage URL" required>
                    <input type="url" value={form.homepageUrl || ''} onChange={(e) => updateField('homepageUrl', e.target.value)} className="form-input" placeholder="https://example.com" required />
                  </FormField>
                  <FormField label="Logo URL">
                    <input type="url" value={form.logoUrl || ''} onChange={(e) => updateField('logoUrl', e.target.value)} className="form-input" placeholder="https://example.com/logo.png" />
                  </FormField>
                </div>
                <FormField label="Categories">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => {
                          const cats = form.categories || [];
                          updateField('categories',
                            cats.includes(cat.slug)
                              ? cats.filter((c: ContentCategory) => c !== cat.slug)
                              : [...cats, cat.slug]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          (form.categories || []).includes(cat.slug)
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                            : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'
                        }`}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Languages">
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_ALL.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => {
                          const langs = form.languages || [];
                          updateField('languages',
                            langs.includes(lang.value)
                              ? langs.filter((l: Language) => l !== lang.value)
                              : [...langs, lang.value]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          (form.languages || []).includes(lang.value)
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </FormField>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.enabled ?? true}
                      onChange={(e) => updateField('enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/20"
                    />
                    <span className="text-sm text-white/50">Enabled</span>
                  </label>
                </div>
              </>
            )}

            {activeTab === 'parser' && (
              <>
                <FormField label="Parser Type">
                  <select
                    value={form.parserConfig?.type || 'css'}
                    onChange={(e) => updateParser('type', e.target.value)}
                    className="form-input"
                  >
                    <option value="css">CSS Selector</option>
                    <option value="xpath">XPath</option>
                    <option value="json">JSON</option>
                    <option value="api">API</option>
                    <option value="html">HTML</option>
                  </select>
                </FormField>
                <FormField label="Search URL Template" required>
                  <input type="text" value={form.parserConfig?.searchUrlTemplate || ''} onChange={(e) => updateParser('searchUrlTemplate', e.target.value)} className="form-input font-mono text-xs" placeholder="https://example.com/search?q={query}" />
                  <p className="text-[10px] text-white/20 mt-1">Use {'{query}'} as placeholder for the search term</p>
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Result Container Selector">
                    <input type="text" value={form.parserConfig?.resultSelector || ''} onChange={(e) => updateParser('resultSelector', e.target.value)} className="form-input font-mono text-xs" placeholder=".search-results .item" />
                  </FormField>
                  <FormField label="Title Selector">
                    <input type="text" value={form.parserConfig?.titleSelector || ''} onChange={(e) => updateParser('titleSelector', e.target.value)} className="form-input font-mono text-xs" placeholder=".title" />
                  </FormField>
                  <FormField label="Poster/Image Selector">
                    <input type="text" value={form.parserConfig?.posterSelector || ''} onChange={(e) => updateParser('posterSelector', e.target.value)} className="form-input font-mono text-xs" placeholder="img.poster" />
                  </FormField>
                  <FormField label="Link Selector">
                    <input type="text" value={form.parserConfig?.linkSelector || ''} onChange={(e) => updateParser('linkSelector', e.target.value)} className="form-input font-mono text-xs" placeholder="a.result-link" />
                  </FormField>
                  <FormField label="Quality Selector">
                    <input type="text" value={form.parserConfig?.qualitySelector || ''} onChange={(e) => updateParser('qualitySelector', e.target.value)} className="form-input font-mono text-xs" placeholder=".quality" />
                  </FormField>
                  <FormField label="Rating Selector">
                    <input type="text" value={form.parserConfig?.ratingSelector || ''} onChange={(e) => updateParser('ratingSelector', e.target.value)} className="form-input font-mono text-xs" placeholder=".rating" />
                  </FormField>
                  <FormField label="Episode Count Selector">
                    <input type="text" value={form.parserConfig?.episodeSelector || ''} onChange={(e) => updateParser('episodeSelector', e.target.value)} className="form-input font-mono text-xs" placeholder=".episodes" />
                  </FormField>
                  <FormField label="Genre Selector">
                    <input type="text" value={form.parserConfig?.genreSelector || ''} onChange={(e) => updateParser('genreSelector', e.target.value)} className="form-input font-mono text-xs" placeholder=".genres span" />
                  </FormField>
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Rate Limit (req/min)">
                    <input type="number" value={form.rateLimit || 30} onChange={(e) => updateField('rateLimit', parseInt(e.target.value))} className="form-input" />
                  </FormField>
                  <FormField label="Timeout (ms)">
                    <input type="number" value={form.timeout || 10000} onChange={(e) => updateField('timeout', parseInt(e.target.value))} className="form-input" />
                  </FormField>
                  <FormField label="Retry Count">
                    <input type="number" value={form.retryCount || 2} onChange={(e) => updateField('retryCount', parseInt(e.target.value))} className="form-input" />
                  </FormField>
                </div>
                <FormField label="User Agent">
                  <input type="text" value={form.userAgent || ''} onChange={(e) => updateField('userAgent', e.target.value)} className="form-input font-mono text-xs" />
                </FormField>
                <FormField label="Cookies">
                  <textarea value={form.cookies || ''} onChange={(e) => updateField('cookies', e.target.value)} className="form-input font-mono text-xs min-h-[60px] resize-y" placeholder="cookie1=value1; cookie2=value2" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Country">
                    <input type="text" value={form.country || ''} onChange={(e) => updateField('country', e.target.value)} className="form-input" placeholder="IN" />
                  </FormField>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t border-white/[0.05] bg-[#111111]">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={isSaving} className="btn-primary text-sm disabled:opacity-50">
              {isSaving ? 'Saving...' : isCreating ? 'Create Website' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// --- Form Field Component ---
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 mb-1.5">
        {label}
        {required && <span className="text-red-400/60 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
