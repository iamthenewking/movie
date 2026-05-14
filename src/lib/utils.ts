import { siteConfig } from '@/configs/site';
import { env } from '@/env.mjs';
import MovieService from '@/services/MovieService';
import type { CategorizedShows, KeyWord, KeyWordResponse, Show } from '@/types';
import { type AxiosResponse } from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { cache } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  buildShowHref,
  buildSlug,
  buildWatchHref,
  extractIdFromSlug,
  normalizeShowName,
} from '@/lib/routes-core';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getYear(input: string | number): number {
  const date = new Date(input);
  return date.getFullYear();
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function formatEnum(input: string): string {
  const words = input.split('_');
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(' ');
}

export function getSearchValue(input: string): string {
  const search = window.location.search;
  if (!search) return '';
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(input) ?? '';
}

export function getSlug(id: number, name: string): string {
  return buildSlug(id, name);
}

export function getIdFromSlug(slug: string): number {
  return extractIdFromSlug(slug);
}

export function clearSearch(): void {
  const searchInput: HTMLInputElement | null = document.getElementById(
    'search-input',
  ) as HTMLInputElement;
  searchInput.blur();
  searchInput.value = '';
  searchInput.defaultValue = '';
}

export function getNameFromShow(show: Show | null): string {
  return normalizeShowName(show ?? {});
}

export function getShowHref(
  show: Pick<Show, 'id' | 'media_type' | 'title' | 'name'>,
): string {
  return buildShowHref({
    id: show.id,
    mediaType: show.media_type,
    title: show.title,
    name: show.name,
  });
}

export function getWatchHref(
  show: Pick<Show, 'id' | 'media_type' | 'title' | 'name'>,
  provider?: string,
): string {
  return buildWatchHref(
    {
      id: show.id,
      mediaType: show.media_type,
      title: show.title,
      name: show.name,
    },
    provider,
  );
}

export function formatRuntime(runtime: number | null): string | null {
  if (!runtime || runtime <= 0) {
    return null;
  }
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (!hours) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

export function getReleaseYear(
  show: Pick<Show, 'release_date' | 'first_air_date'>,
): number | null {
  const input = show.release_date ?? show.first_air_date;
  return input ? getYear(input) : null;
}

let timer: NodeJS.Timeout;
export function debounce(
  func: (...args: (string | object)[]) => void,
  timeout: number,
): (...args: (string | object)[]) => void {
  return (...args: (string | object)[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

export function getMobileDetect(userAgent: NavigatorID['userAgent']) {
  const isAndroid = () => Boolean(userAgent.match(/Android/i));
  const isIos = () => Boolean(userAgent.match(/iPhone|iPad|iPod/i));
  const isOpera = () => Boolean(userAgent.match(/Opera Mini/i));
  const isWindows = () => Boolean(userAgent.match(/IEMobile/i));
  const isSSR = () => Boolean(userAgent.match(/SSR/i));
  const isMobile = () =>
    Boolean(isAndroid() || isIos() || isOpera() || isWindows());
  const isDesktop = () => Boolean(!isMobile() && !isSSR());
  return {
    isMobile,
    isDesktop,
    isAndroid,
    isIos,
    isSSR,
  };
}

export function handleDefaultSearchBtn(): void {
  const seachBtn: HTMLElement | null = document.getElementById('search-btn');
  if (seachBtn != null) seachBtn.focus();
}

export function handleDefaultSearchInp(): void {
  const searchInput: HTMLInputElement | null = document.getElementById(
    'search-input',
  ) as HTMLInputElement;
  if (searchInput != null) {
    const value: string = getSearchValue('q');
    searchInput.value = value;
    searchInput.defaultValue = value;
    searchInput.setSelectionRange(value.length, value.length);
    searchInput.focus();
  }
}

export const handleMetadata = cache(
  async (slug: string, page: string, type: 'tv' | 'movie') => {
    const movieId: number = getIdFromSlug(slug);
    let keywords: string[] = [];
    let data: Show | null = null;
    try {
      const response: AxiosResponse<Show> =
        'tv' === type
          ? await MovieService.findTvSeries(movieId)
          : await MovieService.findMovie(movieId);
      data = response.data;
      const keywordResponse: AxiosResponse<KeyWordResponse> =
        await MovieService.getKeywords(movieId, type);
      const res =
        type === 'tv'
          ? keywordResponse.data.results
          : keywordResponse.data.keywords;
      keywords = res.map((item: KeyWord) => item.name);
    } catch (error) {
      console.log(error);
    }

    return {
      description: data?.overview,
      title: getNameFromShow(data),
      keywords: [
        ...keywords,
        slug.replace(`-${movieId}`, ''),
        env.NEXT_PUBLIC_SITE_NAME,
      ],
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${siteConfig.url}/${page}/${slug}`,
        images: `https://image.tmdb.org/t/p/original${
          data?.backdrop_path ?? data?.poster_path ?? ''
        }`,
        title: getNameFromShow(data),
        description: data?.overview ?? '',
        siteName: siteConfig.name,
      },
      twitter: {
        card: 'summary_large_image',
        title: getNameFromShow(data),
        description: data?.overview ?? '',
        images: `https://image.tmdb.org/t/p/original${
          data?.backdrop_path ?? data?.poster_path ?? ''
        }`,
        creator: siteConfig.author,
      },
    };
  },
);

export async function handleModal(slug: string): Promise<Show | null> {
  if (!slug) return null;
  const movieId: number = getIdFromSlug(slug);
  if (!movieId) return null;
  return MovieService.findCurrentMovie(movieId, slug);
}

export function getRandomShow(allShows: CategorizedShows[]): Show | null {
  const randomNumber = allShows?.length
    ? Math.floor(Math.random() * (allShows[0].shows?.length || 0))
    : 0;
  const randomShow: Show | null =
    allShows?.length && allShows[0].shows?.length
      ? allShows[0].shows[randomNumber]
      : null;
  return randomShow;
}
