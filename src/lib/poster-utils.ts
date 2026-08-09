const INVALID_POSTER_VALUES = new Set(['', 'N/A', 'null', 'undefined']);

const TRUSTED_POSTER_HOSTS = [
  'image.tmdb.org',
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'cdn.myanimelist.net',
  'api.dicebear.com',
];

export function isValidPosterUrl(url: string | null | undefined): url is string {
  if (!url || INVALID_POSTER_VALUES.has(url.trim())) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isTrustedPosterHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return TRUSTED_POSTER_HOSTS.some((trusted) => host === trusted || host.endsWith(`.${trusted}`));
  } catch {
    return false;
  }
}

export async function verifyPosterReachable(url: string): Promise<boolean> {
  if (!isValidPosterUrl(url)) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok) {
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (contentType.startsWith('image/')) return true;
      if (isTrustedPosterHost(url) && (contentType === '' || contentType === 'application/octet-stream')) {
        return true;
      }
    }
  } catch {
    // Try a tiny ranged GET for hosts that block HEAD.
  }

  if (!isTrustedPosterHost(url)) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-512' },
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (!res.ok && res.status !== 206) return false;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    return contentType.startsWith('image/') || contentType === 'application/octet-stream';
  } catch {
    return false;
  }
}

export async function pickItemsWithVerifiedPosters<T extends { poster: string }>(
  items: T[],
  targetCount: number,
  candidatePool = targetCount * 3
): Promise<T[]> {
  const candidates = items.filter((item) => isValidPosterUrl(item.poster)).slice(0, candidatePool);
  if (candidates.length === 0) return [];

  const verified: T[] = [];
  const batchSize = 4;

  for (let i = 0; i < candidates.length && verified.length < targetCount; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item) => ((await verifyPosterReachable(item.poster)) ? item : null))
    );

    for (const item of results) {
      if (item && verified.length < targetCount) {
        verified.push(item);
      }
    }
  }

  return verified;
}
