import { NextRequest, NextResponse } from 'next/server';
import { reorderWebsites } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

export async function PUT(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds array required' }, { status: 400 });
    }
    const websites = reorderWebsites(orderedIds);
    return NextResponse.json(websites);
  } catch {
    return NextResponse.json({ error: 'Failed to reorder websites' }, { status: 400 });
  }
}
