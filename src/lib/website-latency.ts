import type { Website } from '@/types';
import { cache } from './cache';

const LATENCY_CACHE_TTL_MS = 10 * 60 * 1000;
const LATENCY_FAIL_TTL_MS = 2 * 60 * 1000;
const PROBE_CONCURRENCY = 8;
const MAX_PROBE_MS = 5000;

interface LatencyEntry {
  ms: number | null;
}

export async function probeWebsiteLatency(website: Website): Promise<number | null> {
  const cacheKey = `latency:v1:${website.id}`;
  const cached = cache.get<LatencyEntry>(cacheKey);
  if (cached) return cached.ms;

  const timeout = Math.min(website.timeout || MAX_PROBE_MS, MAX_PROBE_MS);
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const headers = {
      'User-Agent': website.userAgent || 'MoviesNet/1.0 (+https://moviesnet.site)',
      Accept: 'text/html,application/xhtml+xml',
    };

    let response = await fetch(website.homepageUrl, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers,
    });

    if (response.status === 405 || response.status === 501 || response.status === 403) {
      response = await fetch(website.homepageUrl, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers,
      });
    }

    clearTimeout(timer);

    if (!response.ok && response.status >= 500) {
      cache.set(cacheKey, { ms: null }, LATENCY_FAIL_TTL_MS);
      return null;
    }

    const ms = Date.now() - start;
    cache.set(cacheKey, { ms }, LATENCY_CACHE_TTL_MS);
    return ms;
  } catch {
    cache.set(cacheKey, { ms: null }, LATENCY_FAIL_TTL_MS);
    return null;
  }
}

/** Probe all websites in parallel batches; returns websiteId → response time (ms) or null if unreachable. */
export async function probeWebsitesLatency(websites: Website[]): Promise<Map<string, number | null>> {
  const map = new Map<string, number | null>();

  for (let i = 0; i < websites.length; i += PROBE_CONCURRENCY) {
    const batch = websites.slice(i, i + PROBE_CONCURRENCY);
    await Promise.all(
      batch.map(async (website) => {
        const ms = await probeWebsiteLatency(website);
        map.set(website.id, ms);
      })
    );
  }

  return map;
}

export function formatLatency(ms: number | null | undefined): string | null {
  if (ms == null || ms < 0) return null;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
