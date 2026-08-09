import type { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { ADMIN_SESSION_COOKIE } from './auth-constants';

export async function getAuthPayload(request: NextRequest) {
  const cookieToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(request: NextRequest) {
  const payload = await getAuthPayload(request);
  if (!payload || !['admin', 'superadmin'].includes(payload.role)) return null;
  return payload;
}
