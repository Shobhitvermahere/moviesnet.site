import type { SearchSuggestionItem } from '@/components/search/SearchSuggestionsSlider';

/** Build /search URL with IMDb metadata when picking a suggestion */
export function buildSearchUrlFromSuggestion(item: SearchSuggestionItem): string {
  const params = new URLSearchParams();
  params.set('q', item.title);
  if (item.imdbId) params.set('imdbId', item.imdbId);
  if (item.poster) params.set('poster', item.poster);
  return `/search?${params.toString()}`;
}
