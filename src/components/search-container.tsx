'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MediaType, type Show } from '@/types';
import ShowsGrid from '@/components/shows-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/stores/search';
import {
  getNameFromShow,
  getShowHref,
  handleDefaultSearchBtn,
  handleDefaultSearchInp,
} from '@/lib/utils';
import { DISCOVERY_TRENDING_QUERIES } from '@/lib/constants';
import {
  filterShows,
  getGenreOptions,
  getLanguageOptions,
  getYearOptions,
  type SearchFilters,
} from '@/lib/search-discovery';
import CustomImage from './custom-image';

interface SearchContainer {
  query: string;
  shows: Show[];
}

const RECENT_SEARCHES_KEY = 'movieko:recent-searches';

export default function SearchContainer({ shows, query }: SearchContainer) {
  const router = useRouter();
  const searchStore = useSearchStore();
  const setSearchOpen = useSearchStore((state) => state.setOpen);
  const setSearchQuery = useSearchStore((state) => state.setQuery);
  const setSearchShows = useSearchStore((state) => state.setShows);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [filters, setFilters] = React.useState<SearchFilters>({
    mediaType: 'all',
    genreId: 'all',
    year: 'all',
    language: 'all',
  });

  React.useEffect(() => {
    setSearchOpen(true);
    setSearchQuery(query);
    setSearchShows(shows);
    const timer1: NodeJS.Timeout = setTimeout(() => {
      handleDefaultSearchBtn();
    }, 5);
    const timer2: NodeJS.Timeout = setTimeout(() => {
      handleDefaultSearchInp();
    }, 10);

    if (typeof window !== 'undefined') {
      const previous = JSON.parse(
        window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]',
      ) as string[];
      const next = [
        query,
        ...previous.filter(
          (item) => item.toLowerCase() !== query.toLowerCase(),
        ),
      ].slice(0, 6);
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      setRecentSearches(next);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [query, setSearchOpen, setSearchQuery, setSearchShows, shows]);

  const genreOptions = getGenreOptions(searchStore.shows);
  const yearOptions = getYearOptions(searchStore.shows);
  const languageOptions = getLanguageOptions(searchStore.shows);

  const filteredShows = filterShows(searchStore.shows, filters);

  const featured = filteredShows[0] ?? searchStore.shows[0] ?? null;
  const movieResults = filteredShows.filter(
    (show) => show.media_type === MediaType.MOVIE,
  );
  const tvResults = filteredShows.filter(
    (show) => show.media_type === MediaType.TV,
  );

  const navigateToQuery = (nextQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  const clearFilters = () =>
    setFilters({
      mediaType: 'all',
      genreId: 'all',
      year: 'all',
      language: 'all',
    });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Discovery
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Results for “{searchStore.query}”
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredShows.length} of {searchStore.shows.length} title
            {searchStore.shows.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
          {featured ? (
            <Link
              href={getShowHref(featured)}
              className="grid gap-5 rounded-3xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
                <CustomImage
                  src={
                    featured.poster_path ?? featured.backdrop_path
                      ? `https://image.tmdb.org/t/p/w500${
                          featured.poster_path ?? featured.backdrop_path
                        }`
                      : '/images/grey-thumbnail.jpg'
                  }
                  alt={getNameFromShow(featured)}
                  fill
                  className="object-cover"
                  sizes="180px"
                />
              </div>
              <div className="flex flex-col justify-center gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Top result
                </p>
                <h2 className="text-2xl font-semibold">
                  {getNameFromShow(featured)}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>
                    {featured.media_type === MediaType.TV ? 'TV Show' : 'Movie'}
                  </span>
                  <span>{Math.round(featured.vote_average * 10)}% Match</span>
                  {featured.original_language ? (
                    <span>{featured.original_language.toUpperCase()}</span>
                  ) : null}
                </div>
                <p className="line-clamp-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {featured.overview ??
                    'Open the title page to see details and start watching.'}
                </p>
              </div>
            </Link>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-sm text-muted-foreground">
              No title matches this query yet.
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Search again
            </p>
            <div className="mt-3 flex gap-2">
              <Input
                defaultValue={searchStore.query}
                placeholder="Try another title, actor, or genre"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigateToQuery((event.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button
                type="button"
                onClick={(event) => {
                  const input = (
                    event.currentTarget.parentElement?.querySelector(
                      'input',
                    ) as HTMLInputElement | null
                  )?.value;
                  if (input?.trim()) {
                    navigateToQuery(input);
                  }
                }}>
                Search
              </Button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Trending queries
                </p>
                <div className="flex flex-wrap gap-2">
                  {DISCOVERY_TRENDING_QUERIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => navigateToQuery(item)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium transition hover:bg-white/[0.08]">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              {recentSearches.length ? (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Recent searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => navigateToQuery(item)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium transition hover:bg-white/[0.08]">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Refine results</h2>
            <p className="text-sm text-muted-foreground">
              Filter by media type, genre, year, and language.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={filters.mediaType}
            onChange={(event) =>
              setFilters((state) => ({
                ...state,
                mediaType: event.target.value as SearchFilters['mediaType'],
              }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All media</option>
            <option value="movie">Movies</option>
            <option value="tv">TV shows</option>
          </select>
          <select
            value={filters.genreId}
            onChange={(event) =>
              setFilters((state) => ({ ...state, genreId: event.target.value }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All genres</option>
            {genreOptions.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {genre.label}
              </option>
            ))}
          </select>
          <select
            value={filters.year}
            onChange={(event) =>
              setFilters((state) => ({ ...state, year: event.target.value }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={filters.language}
            onChange={(event) =>
              setFilters((state) => ({
                ...state,
                language: event.target.value,
              }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All languages</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filteredShows.length} visible
          </Badge>
          {filters.mediaType !== 'all' ? (
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {filters.mediaType === MediaType.TV ? 'TV Shows' : 'Movies'}
            </Badge>
          ) : null}
          {filters.genreId !== 'all' ? (
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {
                genreOptions.find((item) => item.value === filters.genreId)
                  ?.label
              }
            </Badge>
          ) : null}
          {filters.year !== 'all' ? (
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {filters.year}
            </Badge>
          ) : null}
          {filters.language !== 'all' ? (
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {filters.language}
            </Badge>
          ) : null}
        </div>
      </section>

      {movieResults.length ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Movies</h2>
            <p className="text-sm text-muted-foreground">
              {movieResults.length} matches
            </p>
          </div>
          <ShowsGrid shows={movieResults} query={searchStore.query} />
        </section>
      ) : null}

      {tvResults.length ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">TV Shows</h2>
            <p className="text-sm text-muted-foreground">
              {tvResults.length} matches
            </p>
          </div>
          <ShowsGrid shows={tvResults} query={searchStore.query} />
        </section>
      ) : null}

      {!movieResults.length && !tvResults.length ? (
        <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
          <h2 className="text-xl font-semibold">
            No matches for these filters
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try clearing a filter or switching to another trending query.
          </p>
          <div className="mt-4 flex justify-center">
            <Button type="button" onClick={clearFilters}>
              Reset filters
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
