// ============================================================================
// AllSiteHub Search — Live IMDb & TMDB Autocomplete Suggestions API
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { getTrendingSearches } from '@/lib/db';
import { rankAndMergeSuggestions, type SearchSuggestionItem } from '@/lib/suggestion-rank';

export type { SearchSuggestionItem };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const cacheKey = `imdb-sug-v2:${query.toLowerCase()}`;
    const cached = cache.get<SearchSuggestionItem[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ suggestions: cached });
    }

    const suggestions: SearchSuggestionItem[] = [];

    // 1. Try IMDb Suggestions API for 100% exact IMDb title & poster autocomplete
    try {
      const firstChar = query.charAt(0).toLowerCase();
      const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${encodeURIComponent(query)}.json`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(imdbUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.d)) {
          for (const item of data.d.slice(0, 8)) {
            const title = item.l;
            if (!title) continue;

            const year = item.y || null;
            const category = item.q === 'feature' || item.q === 'movie' ? 'Movie' : item.q ? 'TV Series' : 'Media';
            const poster = item.i?.imageUrl
              ? item.i.imageUrl.replace(/\._V1[^.]*\.jpg$/i, '._V1_QL75_UX500_.jpg')
              : null;

            suggestions.push({
              title,
              year,
              category,
              poster,
              imdbId: item.id,
            });
          }
        }
      }
    } catch {
      // Graceful fallback to iTunes API if IMDb suggestions timing out
    }

    // 2. Try iTunes Search API as fallback for HD movie titles
    if (suggestions.length < 4) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1800);
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=6`, { signal: controller.signal });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.results)) {
            for (const movie of data.results) {
              const title = movie.trackName || movie.collectionName;
              if (!title) continue;
              if (suggestions.some((s) => s.title.toLowerCase() === title.toLowerCase())) continue;

              let year: number | null = null;
              if (movie.releaseDate) {
                const y = parseInt(movie.releaseDate.slice(0, 4), 10);
                if (!isNaN(y)) year = y;
              }

              const poster = movie.artworkUrl100 ? movie.artworkUrl100.replace('100x100bb', '200x200bb') : null;

              suggestions.push({
                title,
                year,
                category: 'Movie',
                poster,
              });
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    const dbTrending = getTrendingSearches('today').map((t) => t.query);
    const ranked = rankAndMergeSuggestions(query, suggestions, dbTrending);

    if (ranked.length > 0) {
      cache.set(cacheKey, ranked, 5 * 60 * 1000);
    }

    return NextResponse.json({ suggestions: ranked });
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
