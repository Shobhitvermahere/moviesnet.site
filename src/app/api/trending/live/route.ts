// ============================================================================
// AllSiteHub Search — Real-Time Live Media Details Auto-Fetcher API
// ============================================================================
import { NextResponse } from 'next/server';
import { fetchLiveShowcase } from '@/lib/trending-showcase';

export type { LiveShowcaseItem } from '@/lib/trending-showcase';

export const revalidate = 86400;

export async function GET() {
  const { movies, anime } = await fetchLiveShowcase();
  return NextResponse.json({
    movies,
    anime,
    source: 'imdb-moviemeter-daily',
    timestamp: new Date().toISOString(),
  });
}
