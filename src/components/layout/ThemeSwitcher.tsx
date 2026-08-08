'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLiveTheme } from '@/components/context/ThemeContext';
import { ThemePackConfig, THEME_IDS, type ThemePackId } from '@/components/effects/theme-packs';
import { cn } from '@/lib/utils';

export function ThemeSwitcher({ className }: { className?: string }) {
  const { activeTheme, setTheme } = useLiveTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const active = ThemePackConfig[activeTheme];

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Background theme"
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${active.swatch[1]}, ${active.swatch[2]})`,
          }}
          aria-hidden
        />
        <span className="text-xs font-semibold text-white/70">{active.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Mobile compact */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04]"
        aria-label="Background theme"
        aria-expanded={open}
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-white/20"
          style={{
            background: `linear-gradient(135deg, ${active.swatch[1]}, ${active.swatch[2]})`,
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Background themes"
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-[#0a0d14]/95 backdrop-blur-2xl p-2 shadow-2xl z-[80]"
        >
          <p className="px-2.5 py-2 text-[10px] uppercase tracking-[0.16em] text-white/35 font-medium flex items-center justify-between">
            <span>Live background</span>
            <Link href="/themes" className="normal-case tracking-normal text-[#e8b86d] hover:underline" onClick={() => setOpen(false)}>
              All themes
            </Link>
          </p>
          <div className="space-y-1">
            {THEME_IDS.map((id: ThemePackId) => {
              const pack = ThemePackConfig[id];
              const selected = id === activeTheme;
              return (
                <button
                  key={id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setTheme(id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                    selected ? 'bg-[#e8b86d]/12 border border-[#e8b86d]/25' : 'hover:bg-white/[0.05] border border-transparent'
                  )}
                >
                  <span
                    className="mt-0.5 w-8 h-8 rounded-lg border border-white/10 shrink-0"
                    style={{
                      background: `linear-gradient(145deg, ${pack.swatch[0]} 20%, ${pack.swatch[2]} 55%, ${pack.swatch[1]} 100%)`,
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className={cn('block text-sm font-semibold', selected ? 'text-[#e8b86d]' : 'text-white')}>
                      {pack.name}
                    </span>
                    <span className="block text-[11px] text-white/40 leading-snug mt-0.5">
                      {pack.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
