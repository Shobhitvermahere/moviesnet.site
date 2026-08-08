import { cn } from '@/lib/utils';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** MoviesNet icon — cinema play + discovery hub */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
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
        <linearGradient id="mn-gold" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f5d49a" />
          <stop offset="0.45" stopColor="#e8b86d" />
          <stop offset="1" stopColor="#b8893f" />
        </linearGradient>
        <linearGradient id="mn-plate" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#161a24" />
          <stop offset="1" stopColor="#090c12" />
        </linearGradient>
        <filter id="mn-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Plate */}
      <rect x="3" y="3" width="42" height="42" rx="11" fill="url(#mn-plate)" stroke="url(#mn-gold)" strokeWidth="1.4" />
      <rect x="5.5" y="5.5" width="37" height="37" rx="9" stroke="url(#mn-gold)" strokeWidth="0.5" opacity="0.35" />

      {/* Network arcs — "find everywhere" */}
      <path
        d="M24 11.5c5.8 0 10.5 4.2 10.5 9.5"
        stroke="url(#mn-gold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M24 36.5c-4.2 0-7.5-2.8-7.5-6.2"
        stroke="url(#mn-gold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx="35" cy="13.5" r="1.6" fill="#e8b86d" opacity="0.85" />
      <circle cx="15.5" cy="33" r="1.3" fill="#e8b86d" opacity="0.55" />
      <circle cx="37" cy="24" r="1.1" fill="#e8b86d" opacity="0.4" />

      {/* Lens ring */}
      <circle cx="21.5" cy="21.5" r="10.5" stroke="url(#mn-gold)" strokeWidth="2.1" />

      {/* Play — cinema */}
      <path
        d="M18.2 16.8v9.4l7.8-4.7-7.8-4.7z"
        fill="url(#mn-gold)"
        filter="url(#mn-glow)"
      />

      {/* Search handle */}
      <path
        d="M29.2 29.2l7.3 7.3"
        stroke="url(#mn-gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
