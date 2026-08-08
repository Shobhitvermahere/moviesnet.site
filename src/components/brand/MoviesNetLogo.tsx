import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<LogoSize, { mark: number; text: string }> = {
  sm: { mark: 28, text: 'text-sm' },
  md: { mark: 34, text: 'text-base sm:text-lg' },
  lg: { mark: 44, text: 'text-xl sm:text-2xl' },
};

interface MoviesNetLogoProps {
  size?: LogoSize;
  variant?: 'full' | 'mark';
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function MoviesNetLogo({
  size = 'md',
  variant = 'full',
  href = '/',
  className,
  onClick,
}: MoviesNetLogoProps) {
  const { mark, text } = SIZE_MAP[size];

  const content = (
    <>
      <LogoMark size={mark} />
      {variant === 'full' && (
        <span className={cn('font-display font-bold tracking-tight whitespace-nowrap', text)}>
          <span className="text-white">Movies</span>
          <span className="text-[#e8b86d]">Net</span>
        </span>
      )}
    </>
  );

  const classes = cn('inline-flex items-center gap-2.5 group', className);

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
