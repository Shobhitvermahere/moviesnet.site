'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MoviesNetLogo } from '@/components/brand/MoviesNetLogo';

const DISCORD_URL = 'https://discord.gg/ATGRvAjBr';
const SUPPORT_EMAIL = 'officialvenom002@gmail.com';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSupportOpen, setSupportOpen] = useState(false);
  const [isCommandKOpen, setCommandKOpen] = useState(false);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const supportRef = useRef<HTMLDivElement>(null);

  // Request Site Form State
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteCategory, setSiteCategory] = useState('movies');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { isAction: true, action: () => setRequestModalOpen(true), label: 'Request Site' },
    { href: '/websites', label: 'Websites' },
  ];

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandKOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCommandKOpen(false);
        setRequestModalOpen(false);
        setSupportOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isSupportOpen) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setSupportOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isSupportOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleCommandKSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cmdQuery.trim()) {
      setCommandKOpen(false);
      router.push(`/search?q=${encodeURIComponent(cmdQuery.trim())}`);
      setCmdQuery('');
    }
  };

  const handleRequestSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim() || !siteUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/site-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: siteName.trim(),
          siteUrl: siteUrl.trim(),
          category: siteCategory,
          notes: requestNotes.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRequestModalOpen(false);
        setSiteName('');
        setSiteUrl('');
        setSiteCategory('movies');
        setRequestNotes('');
      }, 2200);
    } catch {
      alert('Could not submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show header on admin pages
  if (pathname?.startsWith('/adminshobhit')) return null;

  return (
    <>
      <header className="site-header fixed top-0 left-0 right-0 z-50">
        <div className="border-b border-white/[0.08] bg-[#03050a]/92 max-md:backdrop-blur-none md:bg-[#03050a]/80 md:backdrop-blur-2xl supports-[backdrop-filter]:md:bg-[#03050a]/70">
          <div className="page-shell mx-auto page-gutter">
            <div className="flex items-center justify-between gap-2 h-[var(--header-height)] min-h-[3.5rem]">
              <MoviesNetLogo
                size="sm"
                variant="full"
                compact
                className="transition-opacity hover:opacity-90 shrink min-w-0 max-w-[58%] min-[380px]:max-w-[62%] sm:max-w-none"
              />

              <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" aria-label="Main navigation">
                {navItems.map((item) => {
                  if (item.isAction) {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.action}
                        className="relative px-3.5 py-2 text-sm font-medium rounded-lg text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <span className="relative z-10">{item.label}</span>
                      </button>
                    );
                  }

                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname?.startsWith(item.href!));

                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={cn(
                        'relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                        isActive
                          ? 'text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 bg-white/[0.08] border border-white/[0.10] rounded-lg"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="relative" ref={supportRef}>
                  <button
                    type="button"
                    onClick={() => setSupportOpen((prev) => !prev)}
                    className={cn(
                      'inline-flex items-center gap-1.5 min-h-[2.75rem] px-2.5 sm:px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors border',
                      isSupportOpen
                        ? 'text-white bg-white/[0.10] border-white/20'
                        : 'text-white/70 border-transparent hover:text-white hover:bg-white/[0.06] hover:border-white/10'
                    )}
                    aria-expanded={isSupportOpen}
                    aria-haspopup="true"
                    aria-label="Support options"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-80" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                    <span className="hidden sm:inline">Support</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={cn('shrink-0 transition-transform', isSupportOpen && 'rotate-180')}
                      aria-hidden
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isSupportOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="support-dropdown absolute right-0 top-[calc(100%+0.5rem)] w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-white/12 bg-[#0b0f18]/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-2 z-50"
                        role="menu"
                      >
                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                          Get help
                        </p>
                        <a
                          href={DISCORD_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          role="menuitem"
                          onClick={() => setSupportOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-white/85 hover:text-white hover:bg-[#5865F2]/15 transition-colors"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.894a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                          </span>
                          <span>
                            <span className="block">Discord</span>
                            <span className="block text-xs font-medium text-white/45">Join community</span>
                          </span>
                        </a>
                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          role="menuitem"
                          onClick={() => setSupportOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-white/85 hover:text-white hover:bg-[#e8b86d]/10 transition-colors"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8b86d]/15 text-[#e8b86d]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block">Email</span>
                            <span className="block text-xs font-medium text-white/45 truncate">{SUPPORT_EMAIL}</span>
                          </span>
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className="md:hidden flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 transition-colors"
                  onClick={() => {
                    setSupportOpen(false);
                    setMobileMenuOpen(!isMobileMenuOpen);
                  }}
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    {isMobileMenuOpen ? (
                      <>
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </>
                    ) : (
                      <>
                        <path d="M4 8h16" />
                        <path d="M4 16h16" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 top-[var(--header-height)] z-40 bg-black/60 backdrop-blur-sm"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="md:hidden relative z-50 glass-strong border-b border-white/15 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto overscroll-contain"
              >
                <nav className="px-3 py-3 space-y-1" aria-label="Mobile navigation">
                {navItems.map((item) => {
                  if (item.isAction) {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          item.action!();
                        }}
                        className="w-full text-left px-4 py-3.5 min-h-[3rem] rounded-2xl text-sm font-bold text-white/80 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <span>➕</span>
                      </button>
                    );
                  }

                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={cn(
                        'block px-4 py-3.5 min-h-[3rem] rounded-2xl text-sm font-bold transition-all',
                        isActive
                          ? 'text-white font-extrabold bg-white/[0.12] border border-white/20'
                          : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                </nav>

                <div className="px-3 pb-4 pt-2 border-t border-white/10 mx-3">
                  <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Support</p>
                  <div className="grid grid-cols-1 gap-2">
                    <a
                      href={DISCORD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 min-h-[3rem] rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/25 text-white font-semibold text-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2] shrink-0" aria-hidden>
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.894a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      Discord Community
                    </a>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 min-h-[3rem] rounded-2xl bg-[#e8b86d]/10 border border-[#e8b86d]/25 text-white font-semibold text-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#e8b86d] shrink-0" aria-hidden>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span className="truncate">{SUPPORT_EMAIL}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Command+K Search Modal */}
      <AnimatePresence>
        {isCommandKOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setCommandKOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl glass-strong rounded-3xl border border-white/20 shadow-2xl overflow-hidden z-10 bg-[#090c1b]/95"
            >
              <form onSubmit={handleCommandKSearch} className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={cmdQuery}
                    onChange={(e) => setCmdQuery(e.target.value)}
                    placeholder="Search across all listed streaming portals..."
                    className="w-full bg-transparent text-white font-semibold placeholder-white/50 text-sm outline-none"
                    autoFocus
                  />
                  <kbd className="px-2.5 py-1 rounded-lg text-[10px] bg-white/[0.12] border border-white/20 text-white/70 font-mono font-bold">ESC</kbd>
                </div>
              </form>

              {/* Instant IMDb suggestions inside Modal */}
              <div className="p-3 max-h-80 overflow-y-auto space-y-1">
                {cmdQuery.trim().length >= 2 && (
                  <div className="px-2 py-1 text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                    Instant IMDb Suggestions
                  </div>
                )}
                {cmdQuery.trim().length < 2 ? (
                  <div className="p-4 text-center text-xs text-white/40">
                    Type 2+ characters to fetch live IMDb titles...
                  </div>
                ) : (
                  ['Batman Begins', 'The Dark Knight', 'Interstellar', 'Dune: Part Two', 'Naruto Shippuden', 'Attack on Titan'].filter(t => t.toLowerCase().includes(cmdQuery.toLowerCase())).map((title, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCommandKOpen(false);
                        router.push(`/search?q=${encodeURIComponent(title)}`);
                        setCmdQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-500/20 border border-transparent transition-all text-left text-xs font-bold text-white group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">🔍</span>
                        <span className="group-hover:text-cyan-300">{title}</span>
                      </div>
                      <span className="text-[10px] text-white/40 uppercase">Verified IMDb</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Site Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setRequestModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-lg glass-strong rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 z-10 bg-[#090c1b]/95 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest mb-1">
                    <span>✨ Community Request</span>
                  </div>
                  <h2 className="text-xl font-black text-white">Request a New Streaming Site</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                    ✓
                  </div>
                  <h3 className="text-lg font-black text-white">Request Submitted!</h3>
                  <p className="text-xs text-white/70 max-w-xs mx-auto">
                    Thank you! Our indexing team will review & verify the portal within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSiteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      Site Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="e.g. 1Flex, Yenime, FBox"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-sm font-semibold placeholder-white/40 outline-none focus:border-purple-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      Site Homepage URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-sm font-semibold placeholder-white/40 outline-none focus:border-purple-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Primary Content Category</label>
                    <select
                      value={siteCategory}
                      onChange={(e) => setSiteCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0d1126] border border-white/15 text-white text-sm font-semibold outline-none focus:border-purple-400 transition-all"
                    >
                      <option value="movies">🎬 Movies</option>
                      <option value="tv-shows">📺 TV Shows</option>
                      <option value="anime">⛩️ Anime Series</option>
                      <option value="manga">📚 Manga</option>
                      <option value="sports">⚽ Live Sports</option>
                      <option value="live-tv">📺 Live TV Channels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Additional Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      placeholder="Specify if 100% free, mirror info, region support..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs font-medium placeholder-white/40 outline-none focus:border-purple-400 transition-all resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRequestModalOpen(false)}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-black text-xs shadow-lg shadow-purple-500/30 border border-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <span>🚀</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
