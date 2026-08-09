const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  /\.local$/i,
  /\.internal$/i,
];

export type SafeUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Accepts public HTTPS URLs only — blocks localhost, private IPs, and non-http(s) schemes. */
export function isSafePublicUrl(raw: string): SafeUrlResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'URL is required' };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: 'Invalid URL format' };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, error: 'URL must use HTTPS' };
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || host.length > 253) {
    return { ok: false, error: 'Invalid hostname' };
  }

  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    return { ok: false, error: 'Private or local URLs are not allowed' };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: 'URLs with credentials are not allowed' };
  }

  const normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '')}`;
  return { ok: true, url: normalized };
}
