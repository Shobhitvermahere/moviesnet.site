// ============================================================================
// AllSiteHub Search — Search API Route
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { executeSearch } from '@/lib/search-engine';
import { addAnalyticsEvent } from '@/lib/db';
import type { SearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const filters: SearchFilters = {};
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const quality = searchParams.get('quality');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort');
    const website = searchParams.get('website');
    const imdbId = searchParams.get('imdbId');
    const poster = searchParams.get('poster');

    if (category) filters.category = category as SearchFilters['category'];
    if (language) filters.language = language as SearchFilters['language'];
    if (quality) filters.quality = quality as SearchFilters['quality'];
    if (status) filters.status = status as SearchFilters['status'];
    if (sort) filters.sort = sort as SearchFilters['sort'];
    if (website) filters.website = website;
    if (imdbId) filters.imdbId = imdbId;
    if (poster) filters.posterHint = poster;

    const results = await executeSearch(query, filters, page);

    // Track analytics (non-blocking — never fail the search response)
    if (query) {
      try {
        addAnalyticsEvent({
          type: 'search',
          query,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking skipped:', analyticsError);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [], totalResults: 0, query: '', filters: {}, suggestions: [], correction: null, searchTime: 0, websitesSearched: 0, page: 1, hasMore: false },
      { status: 500 }
    );
  }
}
