'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** MoviesNet mark — bold M inside a magnifying glass */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const goldId = `mn-gold-${uid}`;
  const plateId = `mn-plate-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={goldId} x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f2cc8a" />
          <stop offset="0.5" stopColor="#e8b86d" />
          <stop offset="1" stopColor="#c49a4a" />
        </linearGradient>
        <linearGradient id={plateId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#141820" />
          <stop offset="1" stopColor="#0a0d12" />
        </linearGradient>
      </defs>

      {/* App tile */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${plateId})`} />

      {/* Search lens */}
      <circle
        cx="19.5"
        cy="19.5"
        r="11.25"
        stroke={`url(#${goldId})`}
        strokeWidth="2.6"
        fill="rgba(232, 184, 109, 0.07)"
      />

      {/* M — centered in lens */}
      <path
        d="M13.8 25.2V14.8h2.65l3.05 4.75 3.05-4.75h2.65v10.4h-2.35v-6.1l-2.75 4.2h-1.6l-2.75-4.2v6.1H13.8Z"
        fill="#f8f4ec"
      />

      {/* Search handle */}
      <path
        d="M27.8 27.8L36.2 36.2"
        stroke={`url(#${goldId})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
