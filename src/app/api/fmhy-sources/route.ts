import { NextRequest, NextResponse } from 'next/server';
import {
  getFmhySources,
  publishFmhySource,
  publishAllFmhySources,
  refreshFmhySourcesFromRemote,
} from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sources = getFmhySources();
  const section = new URL(request.url).searchParams.get('section');
  const published = new URL(request.url).searchParams.get('published');

  let filtered = sources;
  if (section && section !== 'all') {
    filtered = filtered.filter((s) => s.section === section);
  }
  if (published === 'true') filtered = filtered.filter((s) => s.published);
  if (published === 'false') filtered = filtered.filter((s) => !s.published);

  const sections = [...new Set(sources.map((s) => s.section))].sort();

  return NextResponse.json({
    sources: filtered,
    total: sources.length,
    publishedCount: sources.filter((s) => s.published).length,
    sections,
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.action === 'refresh') {
      const sources = await refreshFmhySourcesFromRemote();
      return NextResponse.json({ success: true, total: sources.length });
    }

    if (body.action === 'publish-all') {
      const result = publishAllFmhySources();
      return NextResponse.json({ success: true, ...result });
    }

    if (body.action === 'publish' && body.id) {
      const website = publishFmhySource(body.id);
      if (!website) return NextResponse.json({ error: 'Source not found' }, { status: 404 });
      return NextResponse.json({ success: true, website });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
