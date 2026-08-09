import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

export function enforceRateLimit(
  request: NextRequest,
  key: string,
  limit: number,
  windowMs: number
) {
  const ip = getClientIp(request);
  const result = checkRateLimit({ key: `${key}:${ip}`, limit, windowMs });
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(result.retryAfterSec) } }
    );
  }
  return null;
}
