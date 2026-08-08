'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isThemePackId, type ThemePackId } from '@/components/effects/theme-packs';

interface ThemeContextType {
  activeTheme: ThemePackId;
  setTheme: (id: ThemePackId) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: 'midnight',
  setTheme: () => {},
});

const STORAGE_KEY = 'moviesnet_live_theme';
const DEFAULT_THEME: ThemePackId = 'midnight';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemePackId>(DEFAULT_THEME);

  useEffect(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('unisearch_live_theme') ||
      localStorage.getItem('allsitehub_live_theme');
    const next = isThemePackId(saved) ? saved : DEFAULT_THEME;
    setActiveTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }, []);

  const setTheme = (id: ThemePackId) => {
    setActiveTheme(id);
    localStorage.setItem(STORAGE_KEY, id);
    document.documentElement.setAttribute('data-theme', id);
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useLiveTheme() {
  return useContext(ThemeContext);
}
