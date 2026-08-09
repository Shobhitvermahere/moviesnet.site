import { cache } from './cache';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucketKey = `rate:${key}`;
  const bucket = cache.get<{ count: number; resetAt: number }>(bucketKey);

  if (!bucket || now > bucket.resetAt) {
    cache.set(bucketKey, { count: 1, resetAt: now + windowMs }, windowMs);
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  cache.set(bucketKey, bucket, bucket.resetAt - now);
  return { allowed: true, remaining: limit - bucket.count, retryAfterSec: 0 };
}

export function rateLimitResponse(retryAfterSec: number) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
      },
    }
  );
}
