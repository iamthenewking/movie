import { type Show } from '@/types';
import { getCurrentUser } from '@/lib/local-auth';

export type StoredShow = Pick<
  Show,
  | 'id'
  | 'media_type'
  | 'title'
  | 'name'
  | 'overview'
  | 'poster_path'
  | 'backdrop_path'
  | 'vote_average'
  | 'release_date'
  | 'first_air_date'
  | 'original_language'
  | 'genre_ids'
>;

export type ContinueWatchingEntry = {
  show: StoredShow;
  watchHref: string;
  detailHref: string;
  updatedAt: string;
};

export const PERSONALIZATION_EVENT = 'movieko:personalization-changed';

const STORAGE_KEYS = {
  myList: 'movieko:my-list',
  recentlyViewed: 'movieko:recently-viewed',
  continueWatching: 'movieko:continue-watching',
} as const;

function getScopedStorageKey(
  key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS],
) {
  const user = getCurrentUser();
  return `${key}:${user?.id ?? 'guest'}`;
}

function readJson<T>(key: string, fallbackKey?: string): T[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const value = window.localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T[];
    }
    if (fallbackKey) {
      return JSON.parse(
        window.localStorage.getItem(fallbackKey) ?? '[]',
      ) as T[];
    }
    return [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent(PERSONALIZATION_EVENT, {
      detail: { key },
    }),
  );
}

function readLegacyOrGuestJson<T>(
  key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS],
) {
  return readJson<T>(`${key}:guest`, key);
}

function upsertStoredShow(list: StoredShow[], show: StoredShow) {
  return [show, ...list.filter((item) => item.id !== show.id)].slice(0, 18);
}

export function toStoredShow(show: StoredShow): StoredShow {
  return {
    id: show.id,
    media_type: show.media_type,
    title: show.title ?? null,
    name: show.name ?? null,
    overview: show.overview ?? null,
    poster_path: show.poster_path ?? null,
    backdrop_path: show.backdrop_path ?? null,
    vote_average: show.vote_average ?? 0,
    release_date: show.release_date ?? null,
    first_air_date: show.first_air_date ?? null,
    original_language: show.original_language ?? '',
    genre_ids: show.genre_ids ?? [],
  };
}

export function getMyList() {
  const user = getCurrentUser();
  return readJson<StoredShow>(
    getScopedStorageKey(STORAGE_KEYS.myList),
    user ? undefined : STORAGE_KEYS.myList,
  );
}

export function toggleMyList(show: StoredShow) {
  const list = getMyList();
  const exists = list.some((item) => item.id === show.id);
  const next = exists
    ? list.filter((item) => item.id !== show.id)
    : upsertStoredShow(list, toStoredShow(show));
  writeJson(getScopedStorageKey(STORAGE_KEYS.myList), next);
  return !exists;
}

export function isInMyList(showId: number) {
  return getMyList().some((item) => item.id === showId);
}

export function recordRecentlyViewed(show: StoredShow) {
  const key = getScopedStorageKey(STORAGE_KEYS.recentlyViewed);
  const list = readJson<StoredShow>(key);
  writeJson(key, upsertStoredShow(list, toStoredShow(show)));
}

export function getRecentlyViewed() {
  const user = getCurrentUser();
  return readJson<StoredShow>(
    getScopedStorageKey(STORAGE_KEYS.recentlyViewed),
    user ? undefined : STORAGE_KEYS.recentlyViewed,
  );
}

export function recordContinueWatching(entry: ContinueWatchingEntry) {
  const key = getScopedStorageKey(STORAGE_KEYS.continueWatching);
  const list = readJson<ContinueWatchingEntry>(key);
  const next = [
    entry,
    ...list.filter((item) => item.show.id !== entry.show.id),
  ].slice(0, 18);
  writeJson(key, next);
}

export function getContinueWatching() {
  const user = getCurrentUser();
  return readJson<ContinueWatchingEntry>(
    getScopedStorageKey(STORAGE_KEYS.continueWatching),
    user ? undefined : STORAGE_KEYS.continueWatching,
  );
}

export function migrateGuestPersonalizationToCurrentUser() {
  const user = getCurrentUser();

  if (!user || typeof window === 'undefined') {
    return;
  }

  const scopedEntries = Object.values(STORAGE_KEYS).map((key) => ({
    key,
    targetKey: `${key}:${user.id}`,
  }));

  for (const entry of scopedEntries) {
    if (window.localStorage.getItem(entry.targetKey)) {
      continue;
    }

    const guestValue = readLegacyOrGuestJson(entry.key);
    if (guestValue.length) {
      writeJson(entry.targetKey, guestValue);
    }
  }
}
