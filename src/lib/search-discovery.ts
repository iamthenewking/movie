import type { Show } from '@/types';
import { Genre } from '@/enums/genre';
import {
  applySearchFilters,
  deriveGenreOptions,
  deriveLanguageOptions,
  deriveYearOptions,
} from '@/lib/search-discovery-core';

export type SearchFilters = {
  mediaType: 'all' | 'movie' | 'tv';
  genreId: string;
  year: string;
  language: string;
};

export function getGenreOptions(shows: Show[]) {
  const numericEntries = Object.entries(Genre).filter(
    ([, value]) => typeof value === 'number',
  ) as Array<[string, number]>;
  return deriveGenreOptions(shows, numericEntries);
}

export function getYearOptions(shows: Show[]) {
  return deriveYearOptions(shows);
}

export function getLanguageOptions(shows: Show[]) {
  return deriveLanguageOptions(shows);
}

export function filterShows(shows: Show[], filters: SearchFilters) {
  return applySearchFilters(shows, filters);
}
