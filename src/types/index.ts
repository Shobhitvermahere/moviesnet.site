// ============================================================================
// AllSiteHub Search — Core Type Definitions
// ============================================================================

// --- Website Types ---

export interface Website {
  id: string;
  name: string;
  slug: string;
  description: string;
  homepageUrl: string;
  searchUrl: string;
  logoUrl: string;
  categories: ContentCategory[];
  languages: Language[];
  country: string;
  priority: number;
  enabled: boolean;
  rateLimit: number; // requests per minute
  timeout: number; // ms
  retryCount: number;
  headers: Record<string, string>;
  cookies: string;
  userAgent: string;
  parserConfig: ParserConfig;
  healthStatus: HealthStatus;
  lastHealthCheck: string;
  totalIndexed: number;
  averageUpdateFrequency: string;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParserConfig {
  type: ParserType;
  searchUrlTemplate: string; // e.g. "https://site.com/search?q={query}"
  resultSelector: string; // CSS selector or XPath for result container
  titleSelector: string;
  posterSelector: string;
  linkSelector: string;
  qualitySelector: string;
  languageSelector: string;
  subtitleSelector: string;
  episodeSelector: string;
  seasonSelector: string;
  statusSelector: string;
  genreSelector: string;
  ratingSelector: string;
  yearSelector: string;
  runtimeSelector: string;
  lastUpdatedSelector: string;
  paginationSelector: string;
  // API parser specific
  apiEndpoint: string;
  apiMethod: 'GET' | 'POST';
  apiHeaders: Record<string, string>;
  apiBodyTemplate: string;
  responseMapping: Record<string, string>;
}

export type ParserType = 'css' | 'xpath' | 'json' | 'api' | 'html';

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

// --- Content Types ---

export type ContentCategory =
  | 'anime'
  | 'movies'
  | 'tv-shows'
  | 'manga'
  | 'sports'
  | 'live-tv'
  | 'cartoons'
  | 'documentaries';

export type Language =
  | 'hindi'
  | 'english'
  | 'japanese'
  | 'tamil'
  | 'telugu'
  | 'malayalam'
  | 'kannada'
  | 'dual-audio'
  | 'multi-audio';

export type SubtitleLanguage =
  | 'english'
  | 'hindi'
  | 'spanish'
  | 'french'
  | 'german'
  | 'arabic';

export type Quality = '480p' | '720p' | '1080p' | '2k' | '4k';

export type ContentStatus = 'completed' | 'ongoing' | 'movie' | 'series';

export type SortOption =
  | 'latest'
  | 'popularity'
  | 'highest-quality'
  | 'fastest'
  | 'most-sources';

// --- Search Types ---

export interface StreamingSource {
  websiteId: string;
  websiteName: string;
  websiteLogo: string;
  url: string;
  languages: Language[];
  subtitles: SubtitleLanguage[];
  quality: Quality[];
  verified: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  originalTitle?: string;
  poster: string;
  backdrop?: string | null;
  websiteId: string;
  websiteName: string;
  websiteLogo: string;
  url: string; // Primary website URL
  sources?: StreamingSource[]; // Consolidated duplicate sources across websites!
  languages: Language[];
  subtitles: SubtitleLanguage[];
  quality: Quality[];
  episodeCount: number | null;
  seasonCount: number | null;
  runtime: string | null;
  status: ContentStatus | null;
  genres: string[];
  rating: number | null;
  year: number | null;
  overview?: string;
  tmdbId?: number;
  imdbId?: string;
  confidenceScore?: number;
  cast?: { name: string; character: string; profilePath: string | null }[];
  trailerKey?: string | null;
  similarTitles?: { id: number; title: string; poster: string; year: number | null; rating: number | null }[];
  officialProviders?: { id: string; name: string; logo: string; url: string; type: string }[];
  lastUpdated: string | null;
  verified: boolean;
  category: ContentCategory;
}

export interface SearchFilters {
  category?: ContentCategory;
  language?: Language;
  subtitle?: SubtitleLanguage;
  quality?: Quality;
  status?: ContentStatus;
  website?: string;
  sort?: SortOption;
}

export interface MediaCandidate {
  tmdbId?: number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  year: number | null;
  type: ContentStatus;
  category: ContentCategory;
  poster: string;
  backdrop: string | null;
  overview: string;
  confidenceScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  candidates?: MediaCandidate[]; // Disambiguation candidates (e.g. "Did you mean?")
  totalResults: number;
  query: string;
  filters: SearchFilters;
  suggestions: string[];
  correction: string | null;
  searchTime: number; // ms
  websitesSearched: number;
  page: number;
  hasMore: boolean;
}

export interface SearchSuggestion {
  text: string;
  category?: ContentCategory;
  count: number;
}

// --- Trending Types ---

export interface TrendingItem {
  query: string;
  count: number;
  category: ContentCategory | null;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface TrendingData {
  today: TrendingItem[];
  week: TrendingItem[];
  month: TrendingItem[];
  byCategory: Record<ContentCategory, TrendingItem[]>;
}

// --- Admin / Auth Types ---

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'superadmin' | 'admin' | 'viewer';
  createdAt: string;
  lastLogin: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// --- Analytics Types ---

export interface AnalyticsEvent {
  id: string;
  type: 'search' | 'click' | 'visit' | 'redirect';
  query?: string;
  websiteId?: string;
  resultId?: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export interface DashboardStats {
  totalSearches: number;
  totalClicks: number;
  totalWebsites: number;
  activeWebsites: number;
  avgSearchTime: number;
  topSearches: { query: string; count: number }[];
  topWebsites: { name: string; clicks: number }[];
  failedSearches: number;
  searchesOverTime: { date: string; count: number }[];
  systemHealth: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
}

// --- Category Display ---

export interface CategoryInfo {
  slug: ContentCategory;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  count: number;
}

// --- Settings ---

export interface AppSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminPath: string;
  searchDebounceMs: number;
  searchTimeoutMs: number;
  maxResultsPerPage: number;
  cacheExpiryMs: number;
  enableAnalytics: boolean;
  enableSpellCorrection: boolean;
  maintenanceMode: boolean;
}

// --- Site Requests ---

export type SiteRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SiteRequest {
  id: string;
  siteName: string;
  siteUrl: string;
  category: string;
  notes?: string;
  status: SiteRequestStatus;
  createdAt: string;
  reviewedAt?: string;
}
