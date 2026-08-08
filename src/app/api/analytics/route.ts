// ============================================================================
// AllSiteHub Search — Analytics API Route
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsEvents, getSearchHistory, getWebsites } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cache } from '@/lib/cache';
import type { DashboardStats } from '@/types';

export async function GET(request: NextRequest) {
  // Admin only
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = getAnalyticsEvents();
    const searchHistory = getSearchHistory();
    const websites = getWebsites();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const searchEvents = events.filter((e) => e.type === 'search');
    const clickEvents = events.filter((e) => e.type === 'click' || e.type === 'redirect');

    // Searches over time (last 7 days)
    const searchesOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = searchEvents.filter((e) => {
        const eventDate = new Date(e.timestamp);
        return eventDate >= date && eventDate < nextDate;
      }).length;

      searchesOverTime.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    // Top searches
    const topSearches = searchHistory
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((h) => ({ query: h.query, count: h.count }));

    // Top websites by clicks
    const websiteClicks = new Map<string, number>();
    for (const event of clickEvents) {
      if (event.websiteId) {
        websiteClicks.set(event.websiteId, (websiteClicks.get(event.websiteId) || 0) + 1);
      }
    }

    const topWebsites = Array.from(websiteClicks.entries())
      .map(([id, clicks]) => {
        const website = websites.find((w) => w.id === id);
        return { name: website?.name || id, clicks };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    const stats: DashboardStats = {
      totalSearches: searchEvents.length,
      totalClicks: clickEvents.length,
      totalWebsites: websites.length,
      activeWebsites: websites.filter((w) => w.enabled).length,
      avgSearchTime: 0,
      topSearches,
      topWebsites,
      failedSearches: events.filter((e) => e.type === 'search' && !e.query).length,
      searchesOverTime,
      systemHealth: {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cacheHitRate: cache.stats.hitRate,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
