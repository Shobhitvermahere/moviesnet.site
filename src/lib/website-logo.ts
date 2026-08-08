const LOGO_SIZE = 128;

export function extractWebsiteHostname(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    return new URL(normalized).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
  }
}

export function sanitizeStoredLogoUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const cleaned = url.trim().replace(/&amp;/g, '&');
  if (!/^https?:\/\//i.test(cleaned)) return null;
  if (/favicon\.ico try/i.test(cleaned) || cleaned.length < 12) return null;
  return cleaned;
}

export function getGoogleFaviconUrl(domain: string, size: number = LOGO_SIZE): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${Math.min(size, 128)}`;
}

export function getDuckDuckGoIconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

/** Primary logo URL — auto-fetches from domain when stored URL is missing or invalid. */
export function resolveWebsiteLogoUrl(
  homepageUrl: string,
  storedLogoUrl?: string | null,
  size: number = LOGO_SIZE
): string {
  const domain = extractWebsiteHostname(homepageUrl);
  const stored = sanitizeStoredLogoUrl(storedLogoUrl);

  if (stored) {
    if (stored.includes('google.com/s2/favicons')) {
      try {
        const parsed = new URL(stored);
        parsed.searchParams.set('sz', String(Math.min(size, 128)));
        return parsed.toString();
      } catch {
        return getGoogleFaviconUrl(domain, size);
      }
    }
    return stored;
  }

  return getGoogleFaviconUrl(domain, size);
}

/** Ordered fallbacks when the primary logo fails to load. */
export function getWebsiteLogoFallbacks(
  homepageUrl: string,
  storedLogoUrl?: string | null,
  size: number = LOGO_SIZE
): string[] {
  const domain = extractWebsiteHostname(homepageUrl);
  const stored = sanitizeStoredLogoUrl(storedLogoUrl);
  const urls: string[] = [];

  if (stored && !stored.includes('google.com/s2/favicons')) {
    urls.push(stored);
  }

  urls.push(getGoogleFaviconUrl(domain, size));
  if (size > 64) urls.push(getGoogleFaviconUrl(domain, 64));
  urls.push(getDuckDuckGoIconUrl(domain));

  return [...new Set(urls)];
}

export function enrichWebsiteLogo<T extends { homepageUrl: string; logoUrl?: string }>(website: T): T {
  return {
    ...website,
    logoUrl: resolveWebsiteLogoUrl(website.homepageUrl, website.logoUrl),
  };
}
