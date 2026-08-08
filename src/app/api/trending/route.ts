// ============================================================================
// AllSiteHub Search — Trending API Route
// ============================================================================
import { NextResponse } from 'next/server';
import { getTrendingSearches } from '@/lib/db';

export async function GET() {
  try {
    const today = getTrendingSearches('today');
    const week = getTrendingSearches('week');
    const month = getTrendingSearches('month');

    return NextResponse.json({
      today,
      week,
      month,
    });
  } catch (error) {
    return NextResponse.json({ today: [], week: [], month: [] }, { status: 500 });
  }
}
