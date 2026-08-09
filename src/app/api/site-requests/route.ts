import { NextRequest, NextResponse } from 'next/server';
import {
  getSiteRequests,
  createSiteRequest,
  updateSiteRequest,
  deleteSiteRequest,
  createWebsite,
  getWebsites,
} from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { isHoneypotTriggered, sanitizeText } from '@/lib/security';
import { enforceRateLimit } from '@/lib/api-rate-limit';
import { isSafePublicUrl } from '@/lib/url-validation';
import type { ContentCategory } from '@/types';

function mapRequestCategory(category: string): ContentCategory[] {
  switch (category) {
    case 'movies':
      return ['movies'];
    case 'tv-shows':
      return ['tv-shows'];
    case 'movies-tv':
      return ['movies', 'tv-shows'];
    case 'anime':
      return ['anime'];
    case 'manga':
      return ['manga'];
    case 'sports':
      return ['sports'];
    case 'live-tv':
      return ['live-tv'];
    default:
      return ['movies'];
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET — admin list
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getSiteRequests());
}

// POST — public submit OR admin approve action via body.action
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, 'site-requests', 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const isAdmin = await requireAdmin(request);

    if (isHoneypotTriggered(body.website)) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (body.action === 'approve' && isAdmin) {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

      const requests = getSiteRequests();
      const req = requests.find((r) => r.id === id);
      if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

      const urlCheck = isSafePublicUrl(req.siteUrl);
      if (!urlCheck.ok) {
        return NextResponse.json({ error: urlCheck.error }, { status: 400 });
      }
      const homepage = urlCheck.url;
      const domain = homepage.replace(/^https?:\/\//, '').split('/')[0];
      const slug = slugify(req.siteName) || slugify(domain);
      const maxPriority = Math.max(0, ...getWebsites().map((w) => w.priority));

      const website = createWebsite({
        name: req.siteName,
        slug,
        description: req.notes?.trim() || `Community-requested portal for ${req.siteName}.`,
        homepageUrl: homepage,
        searchUrl: `${homepage}/search?q={query}`,
        logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        categories: mapRequestCategory(req.category),
        languages: ['english', 'multi-audio'],
        country: 'US',
        priority: maxPriority + 1,
        enabled: true,
        rateLimit: 60,
        timeout: 10000,
        retryCount: 2,
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        cookies: '',
        userAgent: 'MoviesNet/1.0',
        parserConfig: {
          type: 'css',
          searchUrlTemplate: `${homepage}/search?q={query}`,
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
        lastHealthCheck: new Date().toISOString(),
        totalIndexed: 0,
        averageUpdateFrequency: 'daily',
        popularity: 0,
      } as never);

      updateSiteRequest(id, { status: 'approved', reviewedAt: new Date().toISOString() });
      return NextResponse.json({ success: true, website });
    }

    if (body.action === 'reject' && isAdmin) {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });
      const updated = updateSiteRequest(id, { status: 'rejected', reviewedAt: new Date().toISOString() });
      if (!updated) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      return NextResponse.json({ success: true, request: updated });
    }

    // Public submission
    const { siteName, siteUrl, category, notes } = body;
    const name = sanitizeText(String(siteName ?? ''), 120);
    const noteText = sanitizeText(String(notes ?? ''), 500);
    if (!name) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    const urlCheck = isSafePublicUrl(String(siteUrl ?? ''));
    if (!urlCheck.ok) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }

    const siteRequest = createSiteRequest({
      siteName: name,
      siteUrl: urlCheck.url,
      category: category || 'movies',
      notes: noteText,
    });

    return NextResponse.json({ success: true, request: siteRequest }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}

// DELETE — admin remove request
export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

  const deleted = deleteSiteRequest(id);
  if (!deleted) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
