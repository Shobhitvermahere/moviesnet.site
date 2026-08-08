import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<LogoSize, { mark: number; text: string; compactText: string }> = {
  sm: { mark: 30, text: 'text-sm', compactText: 'text-sm sm:text-sm md:text-base' },
  md: { mark: 34, text: 'text-base sm:text-lg', compactText: 'text-sm sm:text-base md:text-lg' },
  lg: { mark: 44, text: 'text-xl sm:text-2xl', compactText: 'text-base sm:text-xl md:text-2xl' },
};

interface MoviesNetLogoProps {
  size?: LogoSize;
  variant?: 'full' | 'mark';
  /** Tighter icon + text for header on small screens */
  compact?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function MoviesNetLogo({
  size = 'md',
  variant = 'full',
  compact = false,
  href = '/',
  className,
  onClick,
}: MoviesNetLogoProps) {
  const { mark, text, compactText } = SIZE_MAP[size];

  const content = (
    <>
      <LogoMark size={compact ? Math.max(mark - 2, 26) : mark} />
      {variant === 'full' && (
        <span
          className={cn(
            'logo-wordmark font-display font-bold tracking-tight whitespace-nowrap',
            compact ? compactText : text
          )}
        >
          <span className="text-white">Movies</span>
          <span className="text-[#e8b86d]">Net</span>
        </span>
      )}
    </>
  );

  const classes = cn('inline-flex items-center gap-2 sm:gap-2.5 group min-w-0', className);

  if (href && !onClick) {
    return (
      <Link href={href} className={classes} aria-label="MoviesNet home">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, 'bg-transparent border-0 p-0 cursor-pointer')}>
      {content}
    </button>
  );
}
