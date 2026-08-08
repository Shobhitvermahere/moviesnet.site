import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 text-white">
      <div className="max-w-md w-full glass-lux p-8 rounded-3xl border border-white/15 shadow-2xl text-center space-y-6 bg-[#080b1d]/90">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-purple-500/20">
          🌌
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest">
            404 — Void Boundary
          </span>
          <h1 className="text-2xl font-black text-white">Page Not Found</h1>
          <p className="text-xs text-white/60 leading-relaxed">
            The page or route you are attempting to reach does not exist in the index.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-black text-xs shadow-lg shadow-purple-500/30 border border-white/20 hover:scale-105 transition-all flex items-center justify-center"
          >
            <span>Return to Search Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
