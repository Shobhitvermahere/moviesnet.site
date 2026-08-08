// ============================================================================
// AllSiteHub Search — Health Check API
// ============================================================================
import { NextResponse } from 'next/server';
import { getWebsites, getSettings } from '@/lib/db';
import { cache } from '@/lib/cache';

export async function GET() {
  try {
    const websites = getWebsites();
    const settings = getSettings();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      websites: {
        total: websites.length,
        enabled: websites.filter((w) => w.enabled).length,
        healthy: websites.filter((w) => w.healthStatus === 'healthy').length,
        degraded: websites.filter((w) => w.healthStatus === 'degraded').length,
        down: websites.filter((w) => w.healthStatus === 'down').length,
      },
      cache: cache.stats,
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      maintenanceMode: settings.maintenanceMode,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: 'Health check failed' },
      { status: 500 }
    );
  }
}
