// ============================================================================
// AllSiteHub Search — JSON File-based Data Store
// ============================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import websitesSeed from '../../data/websites.json';
import settingsSeed from '../../data/settings.json';
import adminsSeed from '../../data/admins.json';
import fmhySourcesSeed from '../../data/fmhy-sources.json';
import type {
  Website,
  AdminUser,
  AnalyticsEvent,
  AppSettings,
  TrendingItem,
  SiteRequest,
  FmhySource,
} from '@/types';
import { parseFmhyVideoMarkdown, hostnameFromUrl } from '@/lib/fmhy-parser';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  if (!existsSync(filepath)) {
    if (!process.env.VERCEL) {
      writeFileSync(filepath, JSON.stringify(defaultValue, null, 2));
    }
    return defaultValue;
  }
  try {
    const parsed = JSON.parse(readFileSync(filepath, 'utf-8')) as T;
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(defaultValue) && defaultValue.length > 0) {
      return defaultValue;
    }
    return parsed;
  } catch {
    return defaultValue;
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// --- Websites ---

export function getWebsites(): Website[] {
  return readJson<Website[]>('websites.json', websitesSeed as unknown as Website[]).sort(
    (a, b) => b.priority - a.priority
  );
}

export function isFmhyWebsite(website: Website): boolean {
  const tags = (website as Website & { tags?: string[] }).tags || [];
  // Bulk-imported catalog entries only — not original "FMHY Verified" curated sites
  return tags.includes('FMHY');
}

export function getPublicWebsites(): Website[] {
  return getEnabledWebsites().filter((w) => !isFmhyWebsite(w));
}

export function getEnabledWebsites(): Website[] {
  return getWebsites().filter((w) => w.enabled);
}

export function getWebsiteById(id: string): Website | undefined {
  return getWebsites().find((w) => w.id === id);
}

export function getWebsiteBySlug(slug: string): Website | undefined {
  return getWebsites().find((w) => w.slug === slug);
}

export function createWebsite(data: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Website {
  const websites = getWebsites();
  const website: Website = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  websites.push(website);
  writeJson('websites.json', websites);
  return website;
}

export function updateWebsite(id: string, data: Partial<Website>): Website | null {
  const websites = getWebsites();
  const index = websites.findIndex((w) => w.id === id);
  if (index === -1) return null;
  websites[index] = { ...websites[index], ...data, updatedAt: new Date().toISOString() };
  writeJson('websites.json', websites);
  return websites[index];
}

export function deleteWebsite(id: string): boolean {
  const websites = getWebsites();
  const filtered = websites.filter((w) => w.id !== id);
  if (filtered.length === websites.length) return false;
  writeJson('websites.json', filtered);
  return true;
}

export function reorderWebsites(orderedIds: string[]): Website[] {
  const websites = getWebsites();
  const byId = new Map(websites.map((w) => [w.id, w]));
  const reordered: Website[] = [];
  const now = new Date().toISOString();

  orderedIds.forEach((id, index) => {
    const site = byId.get(id);
    if (!site) return;
    reordered.push({
      ...site,
      priority: orderedIds.length - index,
      updatedAt: now,
    });
    byId.delete(id);
  });

  const remaining = Array.from(byId.values()).sort((a, b) => b.priority - a.priority);
  remaining.forEach((site, index) => {
    reordered.push({
      ...site,
      priority: remaining.length - index,
      updatedAt: now,
    });
  });

  writeJson('websites.json', reordered);
  return reordered;
}

// --- FMHY Sources ---

export function getFmhySources(): FmhySource[] {
  return readJson<FmhySource[]>('fmhy-sources.json', fmhySourcesSeed as unknown as FmhySource[]);
}

function defaultParserConfig(homepage: string) {
  return {
    type: 'css' as const,
    searchUrlTemplate: `${homepage}/search?q={query}`,
    resultSelector: '.result',
    titleSelector: '.title',
    posterSelector: 'img',
    linkSelector: 'a',
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
}

export function publishFmhySource(sourceId: string): Website | null {
  const sources = getFmhySources();
  const source = sources.find((s) => s.id === sourceId);
  if (!source) return null;

  const host = hostnameFromUrl(source.url);
  const existing = getWebsites().find((w) => hostnameFromUrl(w.homepageUrl) === host);
  if (existing) {
    source.published = true;
    writeJson('fmhy-sources.json', sources);
    return existing;
  }

  const maxPriority = Math.max(0, ...getWebsites().map((w) => w.priority));
  const slug =
    source.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || source.id;

  const website = createWebsite({
    name: source.name,
    slug,
    description: `Stream on ${source.name} — curated from FMHY (${source.section}).`,
    homepageUrl: source.url,
    searchUrl: `${source.url}/search?q={query}`,
    logoUrl: `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
    categories: source.categories,
    languages: ['english', 'multi-audio'],
    country: 'US',
    priority: maxPriority + 1,
    enabled: true,
    rateLimit: 60,
    timeout: 10000,
    retryCount: 2,
    headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    cookies: '',
    userAgent: 'MoviesNet/1.0',
    parserConfig: defaultParserConfig(source.url),
    healthStatus: 'unknown',
    lastHealthCheck: new Date().toISOString(),
    totalIndexed: 0,
    averageUpdateFrequency: 'daily',
    popularity: source.featured ? 85 : 50,
  });

  source.published = true;
  writeJson('fmhy-sources.json', sources);
  return website;
}

export function publishAllFmhySources(): { added: number; skipped: number } {
  let added = 0;
  let skipped = 0;
  const sources = getFmhySources();

  for (const source of sources) {
    const host = hostnameFromUrl(source.url);
    const exists = getWebsites().some((w) => hostnameFromUrl(w.homepageUrl) === host);
    if (exists || source.published) {
      skipped += 1;
      source.published = true;
      continue;
    }
    publishFmhySource(source.id);
    added += 1;
  }

  writeJson('fmhy-sources.json', sources);
  return { added, skipped };
}

export async function refreshFmhySourcesFromRemote(): Promise<FmhySource[]> {
  const res = await fetch('https://raw.githubusercontent.com/fmhy/edit/main/docs/video.md');
  if (!res.ok) throw new Error('Failed to fetch FMHY source list');
  const markdown = await res.text();
  const parsed = parseFmhyVideoMarkdown(markdown);
  const existing = getFmhySources();
  const publishedHosts = new Set(
    getWebsites()
      .filter((w) => w.description?.includes('FMHY'))
      .map((w) => hostnameFromUrl(w.homepageUrl))
  );

  const merged: FmhySource[] = parsed.map((site) => {
    const host = hostnameFromUrl(site.url);
    const prev = existing.find((e) => hostnameFromUrl(e.url) === host);
    return {
      ...site,
      source: 'fmhy' as const,
      published: prev?.published || publishedHosts.has(host),
    };
  });

  writeJson('fmhy-sources.json', merged);
  return merged;
}

// --- Site Requests ---

export function getSiteRequests(): SiteRequest[] {
  return readJson<SiteRequest[]>('site-requests.json', []);
}

export function createSiteRequest(
  data: Omit<SiteRequest, 'id' | 'status' | 'createdAt' | 'reviewedAt'>
): SiteRequest {
  const requests = getSiteRequests();
  const request: SiteRequest = {
    ...data,
    id: uuidv4(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  requests.unshift(request);
  writeJson('site-requests.json', requests);
  return request;
}

export function updateSiteRequest(
  id: string,
  data: Partial<SiteRequest>
): SiteRequest | null {
  const requests = getSiteRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  requests[index] = { ...requests[index], ...data };
  writeJson('site-requests.json', requests);
  return requests[index];
}

export function deleteSiteRequest(id: string): boolean {
  const requests = getSiteRequests();
  const filtered = requests.filter((r) => r.id !== id);
  if (filtered.length === requests.length) return false;
  writeJson('site-requests.json', filtered);
  return true;
}

// --- Admin Users ---

const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001',
  username: process.env.ADMIN_USERNAME || 'admin',
  passwordHash: '', // Will be set on first run
  role: 'superadmin',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export function getAdminUsers(): AdminUser[] {
  return readJson<AdminUser[]>('admins.json', adminsSeed as AdminUser[]);
}

export function getAdminByUsername(username: string): AdminUser | undefined {
  return getAdminUsers().find((a) => a.username === username);
}

export function updateAdminUser(id: string, data: Partial<AdminUser>): void {
  const admins = getAdminUsers();
  const index = admins.findIndex((a) => a.id === id);
  if (index !== -1) {
    admins[index] = { ...admins[index], ...data };
    writeJson('admins.json', admins);
  }
}

// --- Analytics ---

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return readJson<AnalyticsEvent[]>('analytics.json', []);
}

export function addAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
  const events = getAnalyticsEvents();
  events.push({
    ...event,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  });
  // Keep only last 10000 events
  const trimmed = events.slice(-10000);
  writeJson('analytics.json', trimmed);
}

// --- Search History ---

export function getSearchHistory(): { query: string; count: number; lastSearched: string }[] {
  return readJson('search-history.json', []);
}

export function addSearchQuery(query: string): void {
  const history = getSearchHistory();
  const existing = history.find((h) => h.query.toLowerCase() === query.toLowerCase());
  if (existing) {
    existing.count += 1;
    existing.lastSearched = new Date().toISOString();
  } else {
    history.push({ query, count: 1, lastSearched: new Date().toISOString() });
  }
  // Keep only last 5000 unique queries
  const sorted = history.sort((a, b) => b.count - a.count).slice(0, 5000);
  writeJson('search-history.json', sorted);
}

export function getTrendingSearches(period: 'today' | 'week' | 'month'): TrendingItem[] {
  const history = getSearchHistory();
  const now = new Date();
  const periodMs = {
    today: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };
  
  return history
    .filter((h) => now.getTime() - new Date(h.lastSearched).getTime() < periodMs[period])
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((h) => ({
      query: h.query,
      count: h.count,
      category: null,
      trend: 'stable' as const,
      changePercent: 0,
    }));
}

// --- Settings ---

const DEFAULT_SETTINGS: AppSettings = {
  siteName: 'MoviesNet',
  siteDescription: 'Search Once. Find Everywhere. Unified media discovery engine across all configured websites.',
  siteUrl: 'https://moviesnet.site',
  adminPath: '/adminshobhit',
  searchDebounceMs: 300,
  searchTimeoutMs: 10000,
  maxResultsPerPage: 24,
  cacheExpiryMs: 5 * 60 * 1000, // 5 minutes
  enableAnalytics: true,
  enableSpellCorrection: true,
  maintenanceMode: false,
};

export function getSettings(): AppSettings {
  return readJson<AppSettings>('settings.json', settingsSeed as AppSettings);
}

export function updateSettings(data: Partial<AppSettings>): AppSettings {
  const settings = { ...getSettings(), ...data };
  writeJson('settings.json', settings);
  return settings;
}
