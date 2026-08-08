import { NextResponse } from 'next/server';
import { getPublicWebsites } from '@/lib/db';
import { buildDirectoryTrendingPicks, fetchLiveShowcase } from '@/lib/trending-showcase';

export async function GET() {
  try {
    const websites = getPublicWebsites();
    const { movies, anime } = await fetchLiveShowcase();
    const picks = buildDirectoryTrendingPicks(websites, [...movies, ...anime], 12);

    return NextResponse.json({
      picks,
      totalSites: websites.length,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ picks: [], totalSites: 0 }, { status: 200 });
  }
}
