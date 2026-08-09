'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/components/seo/GoogleAnalytics';

/** Sends GA4 search events when ?q= is present. */
export function SearchAnalytics() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  useEffect(() => {
    if (q.trim().length >= 2) {
      trackEvent('search', { search_term: q.trim() });
    }
  }, [q]);

  return null;
}
