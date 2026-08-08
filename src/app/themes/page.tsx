'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLiveTheme } from '@/components/context/ThemeContext';
import { ThemePackConfig, THEME_IDS, type ThemePackId } from '@/components/effects/theme-packs';
import { cn } from '@/lib/utils';

export default function ThemesPage() {
  const { activeTheme, setTheme } = useLiveTheme();
  const active = ThemePackConfig[activeTheme];

  return (
    <div className="relative min-h-screen text-[#f4f1ea] px-4 sm:px-6 lg:px-10 xl:px-12 pb-28 pt-10 sm:pt-14">
      <div className="page-shell mx-auto">
        {/* Header */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#e8b86d] mb-4">
            Live backgrounds
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5">
            Choose your atmosphere
          </h1>
          <p className="text-base sm:text-lg text-white/55 leading-relaxed max-w-2xl">
            Six professional live themes for MoviesNet. Pick one and it applies site-wide —
            saved to this browser automatically.
          </p>
        </div>

        {/* Active theme spotlight */}
        <motion.section
          key={activeTheme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-14 sm:mb-20 rounded-3xl border border-white/10 overflow-hidden bg-[#0a0d14]/55 backdrop-blur-xl"
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-0">
            <div
              className="relative min-h-[240px] sm:min-h-[320px] lg:min-h-[380px]"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 40%, ${active.swatch[1]}55 0%, transparent 50%),
                  radial-gradient(ellipse at 75% 60%, ${active.swatch[2]}66 0%, transparent 45%),
                  linear-gradient(160deg, ${active.swatch[0]} 0%, #000 100%)
                `,
              }}
            >
              <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.7), transparent),
                  radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.5), transparent),
                  radial-gradient(1.5px 1.5px at 40% 70%, rgba(255,255,255,0.45), transparent),
                  radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.55), transparent)`,
              }} />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 to-transparent">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e8b86d] mb-2">
                  Currently active
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">{active.name}</h2>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35 mb-3">
                {active.mood}
              </p>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8">
                {active.longDescription}
              </p>
              <div className="flex items-center gap-3 mb-8">
                {active.swatch.map((color) => (
                  <span
                    key={color}
                    className="w-10 h-10 rounded-xl border border-white/15 shadow-inner"
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center self-start px-6 py-3 rounded-xl bg-[#e8b86d] text-[#1a1208] font-display font-bold text-sm hover:bg-[#f0c987] transition-colors"
              >
                View on homepage
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Gallery */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                All themes
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/50">
                Click any theme to apply it instantly across the site.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {THEME_IDS.map((id: ThemePackId, index) => {
              const pack = ThemePackConfig[id];
              const selected = id === activeTheme;

              return (
                <motion.button
                  key={id}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
                  onClick={() => setTheme(id)}
                  className={cn(
                    'group text-left rounded-3xl overflow-hidden border transition-all duration-300',
                    selected
                      ? 'border-[#e8b86d]/45 ring-1 ring-[#e8b86d]/25 bg-[#0a0d14]/70'
                      : 'border-white/10 bg-[#0a0d14]/45 hover:border-white/20 hover:-translate-y-1'
                  )}
                >
                  <div
                    className="relative h-40 sm:h-48"
                    style={{
                      background: `
                        radial-gradient(ellipse at 35% 45%, ${pack.swatch[1]}50 0%, transparent 55%),
                        radial-gradient(ellipse at 80% 70%, ${pack.swatch[2]}55 0%, transparent 50%),
                        linear-gradient(165deg, ${pack.swatch[0]}, #050505)
                      `,
                    }}
                  >
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      {pack.swatch.map((c) => (
                        <span
                          key={c}
                          className="w-3 h-3 rounded-full border border-white/25"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    {selected && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-[#e8b86d] text-[#1a1208] text-[11px] font-bold tracking-wide">
                        Active
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0d14] to-transparent" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="font-display text-xl font-bold text-white group-hover:text-[#e8b86d] transition-colors">
                        {pack.name}
                      </h3>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-white/35 font-semibold">
                        {pack.mood}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                      {pack.description}
                    </p>
                    <span
                      className={cn(
                        'inline-flex text-xs font-semibold tracking-wide',
                        selected ? 'text-[#e8b86d]' : 'text-white/40 group-hover:text-white/70'
                      )}
                    >
                      {selected ? 'Applied' : 'Apply theme'}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Tip */}
        <p className="mt-12 text-sm text-white/40 max-w-2xl">
          You can also switch themes anytime from the header control. Preference stays on this device.
        </p>
      </div>
    </div>
  );
}
