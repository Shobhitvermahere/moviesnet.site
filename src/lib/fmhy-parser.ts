import type { ContentCategory } from '@/types';

export interface FmhyParsedSite {
  id: string;
  name: string;
  url: string;
  section: string;
  categories: ContentCategory[];
  featured: boolean;
  meta: string;
}

const EXCLUDED_HOST_PATTERNS = [
  'reddit.com',
  'discord.com',
  'discord.gg',
  't.me',
  'telegram.me',
  'telegram.org',
  'github.com',
  'greasyfork.org',
  'rentry.co',
  'wikipedia.org',
  'google.com',
  'cse.google.com',
  'apps.apple.com',
  'play.google.com',
  'youtu.be',
  'youtube.com',
  'fmhy.net',
  'raw.githubusercontent.com',
  'chromewebstore.google.com',
  'x.com',
  'twitter.com',
  'notion.site',
  'eventive.org',
  'windscribe.com',
  'greasyfork.org',
  'update.greasyfork.org',
  'wotaku.wiki',
  'thewiki.moe',
];

const STREAMING_SECTIONS = new Set([
  'stream aggregators',
  'p-stream forks',
  'dedicated-server',
  'multi-server',
  'multi-server (backups)',
  'free w/ ads',
  'video streaming',
  'anime streaming',
  'cartoon streaming',
  'tv streaming',
  'drama streaming',
  'classics / public domain',
  'live tv',
  'live sports',
  'sports replays',
]);

export function hostnameFromUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

export function isExcludedUrl(url: string): boolean {
  const host = hostnameFromUrl(url);
  if (!host) return true;
  return EXCLUDED_HOST_PATTERNS.some(
    (pattern) => host === pattern || host.endsWith(`.${pattern}`) || host.includes(pattern)
  );
}

export function inferCategories(meta: string, section: string): ContentCategory[] {
  const cats = new Set<ContentCategory>();
  const m = meta.toLowerCase();
  const s = section.toLowerCase();

  if (s.includes('anime streaming') || m.includes('anime') || m.includes('donghua') || m.includes('hard sub')) {
    cats.add('anime');
  }
  if (s.includes('cartoon')) cats.add('cartoons');
  if (s.includes('live tv') || m.includes('live tv') || m.includes('iptv')) cats.add('live-tv');
  if (s.includes('sport') || m.includes('sport')) cats.add('sports');
  if (m.includes('manga') || s.includes('manga')) cats.add('manga');
  if (m.includes(' tv') || m.includes('/ tv') || s.includes('tv streaming') || m.includes('series')) {
    cats.add('tv-shows');
  }
  if (
    m.includes('movie') ||
    s.includes('stream aggregator') ||
    s.includes('multi-server') ||
    s.includes('dedicated') ||
    s.includes('p-stream')
  ) {
    cats.add('movies');
    if (!cats.has('anime')) cats.add('tv-shows');
  }

  if (cats.size === 0) {
    if (s.includes('streaming') || s.includes('live')) {
      cats.add('movies');
      cats.add('tv-shows');
    } else {
      cats.add('movies');
    }
  }

  return Array.from(cats);
}

function cleanSectionTitle(line: string): string {
  return line.replace(/^##\s*▷\s*/, '').trim();
}

function cleanSiteName(label: string, url: string): string {
  const trimmed = label.replace(/\u2060/g, '').trim();
  if (!trimmed || /^\d+$/.test(trimmed) || trimmed.toLowerCase() === 'mirrors' || trimmed.toLowerCase() === 'status') {
    const host = hostnameFromUrl(url);
    const part = host.split('.')[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  }
  return trimmed;
}

function makeId(host: string): string {
  return host.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseFmhyVideoMarkdown(markdown: string): FmhyParsedSite[] {
  const sites = new Map<string, FmhyParsedSite>();
  let currentSection = '';
  let inVideoStreaming = false;

  const lines = markdown.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('# ► Download Sites')) break;
    if (line.startsWith('# ► Torrent')) break;
    if (line.startsWith('# ► Android Streaming')) break;

    if (line.startsWith('# ►')) {
      inVideoStreaming = true;
      continue;
    }

    if (!inVideoStreaming) continue;

    if (line.startsWith('## ▷')) {
      currentSection = cleanSectionTitle(line);
      continue;
    }

    if (!line.startsWith('* ') || line.startsWith('* **Note**') || line.includes('↪️')) continue;

    const sectionKey = currentSection.toLowerCase();
    if (!STREAMING_SECTIONS.has(sectionKey) && !sectionKey.includes('streaming') && !sectionKey.includes('live')) {
      continue;
    }

    const featured = line.includes('⭐');
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: { label: string; url: string }[] = [];
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(line)) !== null) {
      links.push({ label: match[1], url: match[2].trim() });
    }

    if (links.length === 0) continue;

    const metaPart = line.includes(' - ') ? line.split(' - ').slice(1).join(' - ') : '';
    const categories = inferCategories(metaPart, currentSection);

    for (const link of links) {
      const url = link.url.split(' ')[0];
      if (!url.startsWith('http')) continue;
      if (isExcludedUrl(url)) continue;

      const host = hostnameFromUrl(url);
      if (!host || sites.has(host)) continue;

      const name = cleanSiteName(link.label, url);
      sites.set(host, {
        id: makeId(host),
        name,
        url: url.replace(/\/$/, ''),
        section: currentSection,
        categories,
        featured,
        meta: metaPart.slice(0, 200),
      });
    }
  }

  return Array.from(sites.values()).sort((a, b) => a.name.localeCompare(b.name));
}
