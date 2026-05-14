'use client';

import React from 'react';
import ShowsCarousel from '@/components/shows-carousel';
import {
  PERSONALIZATION_EVENT,
  getContinueWatching,
  getMyList,
  getRecentlyViewed,
} from '@/lib/personalization';
import { useAuthStore } from '@/stores/auth';
import type { Show } from '@/types';

export default function PersonalizedShelves() {
  const [continueWatching, setContinueWatching] = React.useState<Show[]>([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState<Show[]>([]);
  const [myList, setMyList] = React.useState<Show[]>([]);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }
    setContinueWatching(getContinueWatching().map((item) => item.show as Show));
    setRecentlyViewed(getRecentlyViewed() as Show[]);
    setMyList(getMyList() as Show[]);
  }, [hydrated, user]);

  React.useEffect(() => {
    const syncShelves = () => {
      setContinueWatching(
        getContinueWatching().map((item) => item.show as Show),
      );
      setRecentlyViewed(getRecentlyViewed() as Show[]);
      setMyList(getMyList() as Show[]);
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key?.startsWith('movieko:')) {
        return;
      }
      syncShelves();
    };

    window.addEventListener(PERSONALIZATION_EVENT, syncShelves);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(PERSONALIZATION_EVENT, syncShelves);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!continueWatching.length && !recentlyViewed.length && !myList.length) {
    return null;
  }

  return (
    <>
      {continueWatching.length ? (
        <ShowsCarousel title="Continue Watching" shows={continueWatching} />
      ) : null}
      {recentlyViewed.length ? (
        <ShowsCarousel title="Recently Viewed" shows={recentlyViewed} />
      ) : null}
      {myList.length ? <ShowsCarousel title="My List" shows={myList} /> : null}
    </>
  );
}
