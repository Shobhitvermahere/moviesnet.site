// ============================================================================
// AllSiteHub Search — Zustand Stores
// ============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchFilters, ContentCategory, SearchResult } from '@/types';

// --- Search Store ---
interface SearchState {
  query: string;
  filters: SearchFilters;
  isSearching: boolean;
  recentSearches: string[];
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setIsSearching: (searching: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      filters: {},
      isSearching: false,
      recentSearches: [],
      setQuery: (query) => set({ query }),
      setFilters: (filters) => set({ filters }),
      setIsSearching: (isSearching) => set({ isSearching }),
      addRecentSearch: (query) => {
        const current = get().recentSearches;
        const filtered = current.filter((s) => s !== query);
        set({ recentSearches: [query, ...filtered].slice(0, 10) });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
      resetFilters: () => set({ filters: {} }),
    }),
    {
      name: 'allsitehub-search',
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
);

// --- UI Store ---
interface UIState {
  isMobileMenuOpen: boolean;
  isFilterPanelOpen: boolean;
  activeCategory: ContentCategory | null;
  mousePosition: { x: number; y: number };
  setMobileMenuOpen: (open: boolean) => void;
  setFilterPanelOpen: (open: boolean) => void;
  setActiveCategory: (category: ContentCategory | null) => void;
  setMousePosition: (pos: { x: number; y: number }) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isFilterPanelOpen: true,
  activeCategory: null,
  mousePosition: { x: 0, y: 0 },
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setMousePosition: (pos) => set({ mousePosition: pos }),
}));

// --- Admin Store ---
interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  selectedWebsite: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  setSelectedWebsite: (id: string | null) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      username: null,
      selectedWebsite: null,
      login: (token, username) => set({ isAuthenticated: true, token, username }),
      logout: () => set({ isAuthenticated: false, token: null, username: null }),
      setSelectedWebsite: (id) => set({ selectedWebsite: id }),
    }),
    {
      name: 'allsitehub-admin',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        username: state.username,
      }),
    }
  )
);

// --- Favorites Store ---
interface FavoritesState {
  favorites: SearchResult[];
  addFavorite: (result: SearchResult) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (result) => set({ favorites: [...get().favorites, result] }),
      removeFavorite: (id) => set({ favorites: get().favorites.filter((f) => f.id !== id) }),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
    }),
    { name: 'allsitehub-favorites' }
  )
);
