'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for diagnostics
    console.error('Captured Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050714] text-white">
      <div className="max-w-md w-full glass-lux p-8 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-6 bg-[#090c1e]/90">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-rose-500/20 animate-pulse">
          ⚠️
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-widest">
            Automatic Recovery Active
          </span>
          <h1 className="text-2xl font-black text-white">Temporary Engine Stutter</h1>
          <p className="text-xs text-white/60 leading-relaxed">
            Don't worry, your session data is safe. A temporary connection issue occurred while fetching media telemetry.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-black text-xs shadow-lg shadow-purple-500/30 border border-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>🔄 Recover & Reload</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center"
          >
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
