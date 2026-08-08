// ============================================================================
// AllSiteHub Search — Auth Utilities (JWT)
// ============================================================================
import { SignJWT, jwtVerify } from 'jose';
import { getAdminByUsername, updateAdminUser } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'allsitehub-super-secret-key-change-in-production'
);
const JWT_EXPIRY = '24h';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'allsitehub-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function generateToken(userId: string, username: string, role: string): Promise<string> {
  return new SignJWT({ userId, username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{
  userId: string;
  username: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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

  // If password hash is empty, this is first login — set the password
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

  updateAdminUser(admin.id, { lastLogin: new Date().toISOString() });
  const token = await generateToken(admin.id, admin.username, admin.role);
  return { success: true, token };
}
