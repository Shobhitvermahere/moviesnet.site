// ============================================================================
// AllSiteHub Search — Auth Utilities (JWT + scrypt passwords)
// ============================================================================
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { SignJWT, jwtVerify } from 'jose';
import { getAdminByUsername, updateAdminUser } from './db';
import { ADMIN_SESSION_COOKIE } from './auth-constants';

export { ADMIN_SESSION_COOKIE };

const scryptAsync = promisify(scrypt);
const SCRYPT_PREFIX = 'scrypt$';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.VERCEL) {
    throw new Error('JWT_SECRET must be set in production');
  }
  return new TextEncoder().encode(secret || 'dev-only-jwt-secret-not-for-production');
}

const JWT_EXPIRY = '24h';

async function legacySha256Hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'allsitehub-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${SCRYPT_PREFIX}${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith(SCRYPT_PREFIX)) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(derived, expected);
  }

  const legacy = await legacySha256Hash(password);
  return legacy === storedHash;
}

export async function generateToken(userId: string, username: string, role: string): Promise<string> {
  return new SignJWT({ userId, username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<{
  userId: string;
  username: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function authenticateAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const admin = getAdminByUsername(username);

  if (!admin) {
    return { success: false, error: 'Invalid credentials' };
  }

  if (!admin.passwordHash) {
    const hash = await hashPassword(password);
    updateAdminUser(admin.id, {
      passwordHash: hash,
      lastLogin: new Date().toISOString(),
    });
    const token = await generateToken(admin.id, admin.username, admin.role);
    return { success: true, token };
  }

  const isValid = await verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  if (!admin.passwordHash.startsWith(SCRYPT_PREFIX)) {
    updateAdminUser(admin.id, {
      passwordHash: await hashPassword(password),
      lastLogin: new Date().toISOString(),
    });
  } else {
    updateAdminUser(admin.id, { lastLogin: new Date().toISOString() });
  }

  const token = await generateToken(admin.id, admin.username, admin.role);
  return { success: true, token };
}

export function adminSessionCookieOptions(maxAgeSec = 60 * 60 * 24) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: maxAgeSec,
  };
}
