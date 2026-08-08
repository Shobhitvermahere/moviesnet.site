import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const FMHY_URL = 'https://raw.githubusercontent.com/fmhy/edit/main/docs/video.md';

const EXCLUDED_HOST_PATTERNS = [
  'reddit.com', 'discord.com', 'discord.gg', 't.me', 'telegram.me', 'telegram.org',
  'github.com', 'greasyfork.org', 'rentry.co', 'wikipedia.org', 'google.com',
  'cse.google.com', 'apps.apple.com', 'play.google.com', 'youtu.be', 'youtube.com',
  'fmhy.net', 'chromewebstore.google.com', 'x.com', 'twitter.com', 'notion.site',
  'eventive.org', 'wotaku.wiki', 'thewiki.moe',
];

const STREAMING_SECTIONS = new Set([
  'stream aggregators', 'p-stream forks', 'dedicated-server', 'multi-server',
  'multi-server (backups)', 'free w/ ads', 'video streaming', 'anime streaming',
  'cartoon streaming', 'tv streaming', 'drama streaming', 'classics / public domain',
  'live tv', 'live sports', 'sports replays',
]);

function hostnameFromUrl(url) {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./i, '').toLowerCase();
  } catch { return ''; }
}

function isExcludedUrl(url) {
  const host = hostnameFromUrl(url);
  if (!host) return true;
  return EXCLUDED_HOST_PATTERNS.some((p) => host === p || host.endsWith(`.${p}`) || host.includes(p));
}

function inferCategories(meta, section) {
  const cats = new Set();
  const m = meta.toLowerCase();
  const s = section.toLowerCase();
  if (s.includes('anime streaming') || m.includes('anime') || m.includes('donghua') || m.includes('hard sub')) cats.add('anime');
  if (s.includes('cartoon')) cats.add('cartoons');
  if (s.includes('live tv') || m.includes('live tv') || m.includes('iptv')) cats.add('live-tv');
  if (s.includes('sport') || m.includes('sport')) cats.add('sports');
  if (m.includes('manga')) cats.add('manga');
  if (m.includes(' tv') || m.includes('/ tv') || s.includes('tv streaming') || m.includes('series')) cats.add('tv-shows');
  if (m.includes('movie') || s.includes('stream aggregator') || s.includes('multi-server') || s.includes('dedicated') || s.includes('p-stream')) {
    cats.add('movies');
    if (!cats.has('anime')) cats.add('tv-shows');
  }
  if (cats.size === 0) {
    if (s.includes('streaming') || s.includes('live')) { cats.add('movies'); cats.add('tv-shows'); }
    else cats.add('movies');
  }
  return [...cats];
}

function parseFmhy(markdown) {
  const sites = new Map();
  let currentSection = '';
  let inVideoStreaming = false;

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('# ► Download Sites') || line.startsWith('# ► Torrent') || line.startsWith('# ► Android Streaming')) break;
    if (line.startsWith('# ►')) { inVideoStreaming = true; continue; }
    if (!inVideoStreaming) continue;
    if (line.startsWith('## ▷')) { currentSection = line.replace(/^##\s*▷\s*/, '').trim(); continue; }
    if (!line.startsWith('* ') || line.startsWith('* **Note**') || line.includes('↪️')) continue;

    const sectionKey = currentSection.toLowerCase();
    if (!STREAMING_SECTIONS.has(sectionKey) && !sectionKey.includes('streaming') && !sectionKey.includes('live')) continue;

    const featured = line.includes('⭐');
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(line)) !== null) links.push({ label: match[1], url: match[2].trim() });

    const metaPart = line.includes(' - ') ? line.split(' - ').slice(1).join(' - ') : '';
    const categories = inferCategories(metaPart, currentSection);

    for (const link of links) {
      const url = link.url.split(' ')[0];
      if (!url.startsWith('http') || isExcludedUrl(url)) continue;
      const host = hostnameFromUrl(url);
      if (!host || sites.has(host)) continue;
      let name = link.label.replace(/\u2060/g, '').trim();
      if (!name || /^\d+$/.test(name) || name.toLowerCase() === 'mirrors' || name.toLowerCase() === 'status') {
        const part = host.split('.')[0];
        name = part.charAt(0).toUpperCase() + part.slice(1);
      }
      sites.set(host, { id: host.replace(/[^a-z0-9]+/g, '-'), name, url: url.replace(/\/$/, ''), section: currentSection, categories, featured, meta: metaPart.slice(0, 200), source: 'fmhy', published: false });
    }
  }
  return [...sites.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function makeWebsite(site, priority) {
  const host = hostnameFromUrl(site.url);
  const now = new Date().toISOString();
  return {
    id: site.id || slugify(host),
    name: site.name,
    slug: slugify(site.name) || slugify(host),
    description: `Stream on ${site.name} — curated from FMHY (${site.section}).`,
    homepageUrl: site.url,
    searchUrl: `${site.url}/search?q={query}`,
    logoUrl: `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
    categories: site.categories,
    languages: ['english', 'multi-audio'],
    country: 'US',
    priority,
    enabled: true,
    rateLimit: 60,
    timeout: 10000,
    retryCount: 2,
    headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    cookies: '',
    userAgent: 'MoviesNet/1.0',
    tags: site.featured ? ['FMHY', 'Featured'] : ['FMHY'],
    parserConfig: {
      type: 'css',
      searchUrlTemplate: `${site.url}/search?q={query}`,
      resultSelector: '.result',
      titleSelector: '.title',
      posterSelector: 'img',
      linkSelector: 'a',
      qualitySelector: '',
      languageSelector: '',
      subtitleSelector: '',
      episodeSelector: '',
      seasonSelector: '',
      statusSelector: '',
      genreSelector: '',
      ratingSelector: '',
      yearSelector: '',
      runtimeSelector: '',
      lastUpdatedSelector: '',
      paginationSelector: '',
      apiEndpoint: '',
      apiMethod: 'GET',
      apiHeaders: {},
      apiBodyTemplate: '',
      responseMapping: {},
    },
    healthStatus: 'unknown',
    lastHealthCheck: now,
    totalIndexed: 0,
    averageUpdateFrequency: 'daily',
    popularity: site.featured ? 85 : 50,
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  console.log('Fetching FMHY video.md...');
  const res = await fetch(FMHY_URL);
  const markdown = await res.text();
  const fmhySites = parseFmhy(markdown);
  console.log(`Parsed ${fmhySites.length} FMHY streaming sites`);

  const fmhyPath = join(root, 'data', 'fmhy-sources.json');
  const fmhyWithMeta = fmhySites.map((s) => ({ ...s, source: 'fmhy', published: false }));
  writeFileSync(fmhyPath, JSON.stringify(fmhyWithMeta, null, 2));
  console.log(`FMHY catalog: ${fmhyWithMeta.length} sites saved to backend only (not added to public directory)`);
}

main().catch(console.error);
