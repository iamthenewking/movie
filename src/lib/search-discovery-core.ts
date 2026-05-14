export type SearchDiscoveryShow = {
  media_type: 'movie' | 'tv' | 'all';
  genre_ids?: number[];
  release_date?: string | null;
  first_air_date?: string | null;
  original_language?: string | null;
};

export type SearchFiltersCore = {
  mediaType: 'all' | 'movie' | 'tv';
  genreId: string;
  year: string;
  language: string;
};

export function formatEnumLabel(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function extractYear(value?: string | null) {
  if (!value) {
    return null;
  }
  return new Date(value).getFullYear();
}

export function deriveGenreOptions<T extends SearchDiscoveryShow>(
  shows: T[],
  enumEntries: Array<[string, number]>,
) {
  const presentGenres = new Set(shows.flatMap((show) => show.genre_ids ?? []));
  return enumEntries
    .filter(([, value]) => presentGenres.has(value))
    .map(([key, value]) => ({
      label: formatEnumLabel(key),
      value: String(value),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function deriveYearOptions<T extends SearchDiscoveryShow>(shows: T[]) {
  return Array.from(
    new Set(
      shows
        .map((show) => show.release_date ?? show.first_air_date)
        .filter(Boolean)
        .map((date) => String(extractYear(date))),
    ),
  ).sort((a, b) => Number(b) - Number(a));
}

export function deriveLanguageOptions<T extends SearchDiscoveryShow>(
  shows: T[],
) {
  return Array.from(
    new Set(
      shows
        .map((show) => show.original_language?.toUpperCase())
        .filter(Boolean),
    ),
  ).sort();
}

export function applySearchFilters<T extends SearchDiscoveryShow>(
  shows: T[],
  filters: SearchFiltersCore,
) {
  return shows.filter((show) => {
    if (filters.mediaType !== 'all' && show.media_type !== filters.mediaType) {
      return false;
    }
    if (
      filters.genreId !== 'all' &&
      !(show.genre_ids ?? []).includes(Number(filters.genreId))
    ) {
      return false;
    }
    if (filters.year !== 'all') {
      const year = extractYear(show.release_date ?? show.first_air_date);
      if (!year || String(year) !== filters.year) {
        return false;
      }
    }
    if (
      filters.language !== 'all' &&
      show.original_language?.toUpperCase() !== filters.language
    ) {
      return false;
    }
    return true;
  });
}
