// ============================================================================
// AllSiteHub Search — Auth API Route
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, adminSessionCookieOptions } from '@/lib/auth';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth-constants';
import { getAdminUsers } from '@/lib/db';
import { getAuthPayload } from '@/lib/api-auth';
import { getClientIp } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

// POST /api/auth — Login
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit({ key: `auth-post:${ip}`, limit: 8, windowMs: 15 * 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
    }

    const { username, password } = await request.json();

    if (!password || typeof password !== 'string' || password.length > 256) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const admins = getAdminUsers();
    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const resolvedUsername = typeof username === 'string' && username.trim() ? username.trim() : envUsername;
    const matchedAdmin = admins.find((admin) => admin.username === resolvedUsername);

    if (!matchedAdmin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const result = await authenticateAdmin(matchedAdmin.username, password);

    if (!result.success || !result.token) {
      return NextResponse.json({ error: result.error || 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      username: matchedAdmin.username,
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, result.token, adminSessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// GET /api/auth — Verify session
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      username: payload.username,
      role: payload.role,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// DELETE /api/auth — Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { ...adminSessionCookieOptions(0), maxAge: 0 });
  return response;
}
