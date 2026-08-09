// ============================================================================
// AllSiteHub Search — Auth API Route
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, verifyToken } from '@/lib/auth';
import { getAdminUsers } from '@/lib/db';

// POST /api/auth — Login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const admins = getAdminUsers();
    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const matchedAdmin =
      admins.find((admin) => admin.username === (username || envUsername)) || admins[0];

    if (!matchedAdmin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const result = await authenticateAdmin(matchedAdmin.username, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      username: matchedAdmin.username,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// GET /api/auth — Verify token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      username: payload.username,
      role: payload.role,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
