'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/stores';
import { useRouter } from 'next/navigation';
import { MoviesNetLogo } from '@/components/brand/MoviesNetLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAdminStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/adminshobhit');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success && data.username) {
        login(data.username);
        router.push('/adminshobhit');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black text-white">
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-black/70 border border-white/20 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MoviesNetLogo size="lg" href="/" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight mb-2">Admin Panel</h1>
          <p className="text-sm font-medium text-gray-300">Enter your password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-200 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-red-300 bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xs font-medium text-gray-400 mt-6">
          🔒 Security Protected Area — Authorized Access Only
        </p>
      </motion.div>
    </div>
  );
}
