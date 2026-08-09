'use client';

import { useEffect, useState } from 'react';

interface WebsiteRankControlProps {
  rank: number;
  maxRank: number;
  onApply: (rank: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function WebsiteRankControl({
  rank,
  maxRank,
  onApply,
  disabled = false,
  compact = false,
}: WebsiteRankControlProps) {
  const [value, setValue] = useState(String(rank));

  useEffect(() => {
    setValue(String(rank));
  }, [rank]);

  const apply = () => {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed)) return;
    onApply(Math.max(1, Math.min(parsed, maxRank)));
  };

  return (
    <div
      className={`flex items-center gap-1.5 shrink-0 ${compact ? '' : 'flex-col sm:flex-row sm:items-center'}`}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDragOver={(e) => e.preventDefault()}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-white/40 whitespace-nowrap">
        Rank
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={1}
          max={maxRank}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              apply();
            }
          }}
          className="w-14 px-2 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs font-mono text-center focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
          aria-label={`Set search rank, currently ${rank}`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={apply}
          className="px-2 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-[10px] font-bold text-purple-100 uppercase tracking-wide transition-colors disabled:opacity-50"
        >
          Set
        </button>
      </div>
    </div>
  );
}
