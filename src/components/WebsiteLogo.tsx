'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { getWebsiteLogoFallbacks } from '@/lib/website-logo';

interface WebsiteLogoProps {
  homepageUrl: string;
  logoUrl?: string | null;
  name: string;
  className?: string;
  imgClassName?: string;
  size?: number;
}

export function WebsiteLogo({
  homepageUrl,
  logoUrl,
  name,
  className,
  imgClassName,
  size = 128,
}: WebsiteLogoProps) {
  const fallbacks = useMemo(
    () => getWebsiteLogoFallbacks(homepageUrl, logoUrl, size),
    [homepageUrl, logoUrl, size]
  );
  const [index, setIndex] = useState(0);
  const failed = index >= fallbacks.length;

  if (failed) {
    return (
      <span
        className={cn(
          'flex items-center justify-center font-bold text-[#e8b86d] bg-[#e8b86d]/10',
          className
        )}
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fallbacks[index]}
      alt=""
      className={cn('object-contain', imgClassName, className)}
      loading="lazy"
      decoding="async"
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
