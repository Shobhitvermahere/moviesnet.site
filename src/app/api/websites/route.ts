// ============================================================================
// AllSiteHub Search — Websites CRUD API
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { getWebsites, createWebsite, updateWebsite, deleteWebsite, getWebsiteById, getPublicWebsites } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { enrichWebsiteLogo } from '@/lib/website-logo';

// Verify admin auth helper
async function checkAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  return payload !== null;
}

// GET /api/websites — List all websites (public, but limited info)
export async function GET(request: NextRequest) {
  const isAdmin = await checkAuth(request);
  const websites = getWebsites().sort((a, b) => b.priority - a.priority);

  if (isAdmin) {
    return NextResponse.json(websites);
  }

  // Public view: AllSiteHub directory only (FMHY catalog stays in admin backend)
  const publicWebsites = getPublicWebsites()
    .map((w) => enrichWebsiteLogo({
      id: w.id,
      name: w.name,
      slug: w.slug,
      description: w.description,
      homepageUrl: w.homepageUrl,
      logoUrl: w.logoUrl,
      categories: w.categories,
      languages: w.languages,
      country: w.country,
      healthStatus: w.healthStatus,
      totalIndexed: w.totalIndexed,
      averageUpdateFrequency: w.averageUpdateFrequency,
      popularity: w.popularity,
      priority: w.priority,
      tags: (w as unknown as { tags?: string[] }).tags || [],
    }));

  return NextResponse.json(publicWebsites);
}

// POST /api/websites — Create a website (admin only)
export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const website = createWebsite(body);
    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create website' }, { status: 400 });
  }
}

// PUT /api/websites — Update a website (admin only)
export async function PUT(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Missing website ID' }, { status: 400 });

    const website = updateWebsite(id, data);
    if (!website) return NextResponse.json({ error: 'Website not found' }, { status: 404 });

    return NextResponse.json(website);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update website' }, { status: 400 });
  }
}

// DELETE /api/websites — Delete a website (admin only)
export async function DELETE(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing website ID' }, { status: 400 });

    const deleted = deleteWebsite(id);
    if (!deleted) return NextResponse.json({ error: 'Website not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 400 });
  }
}
