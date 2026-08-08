'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#050714] text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-lux p-8 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-6 bg-[#090c1e]">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-rose-500/20">
            🚨
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">System Error Recovery</h1>
            <p className="text-xs text-white/60 leading-relaxed">
              An unexpected system interruption was safely isolated by the recovery engine.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-black text-xs shadow-lg shadow-purple-500/30 border border-white/20 hover:scale-105 transition-all"
          >
            <span>Restart & Restore Engine</span>
          </button>
        </div>
      </body>
    </html>
  );
}
