import React from 'react';
import WatchRouteActivator from '@/components/watch/watch-route-activator';
import {
  getNextWatchProviderId,
  resolveCurrentWatchProvider,
} from '@/lib/watch-providers';
import { getIdFromSlug, getSlug } from '@/lib/utils';
import { MediaType } from '@/types';
import { notFound } from 'next/navigation';
import MovieService from '@/services/MovieService';

export const revalidate = 3600;

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { provider?: string };
}) {
  const id = getIdFromSlug(params.slug);
  if (!id) {
    notFound();
  }

  const currentProvider = resolveCurrentWatchProvider({
    id,
    mediaType: MediaType.TV,
    providerId: searchParams?.provider,
  });
  const nextProviderId = getNextWatchProviderId(currentProvider.id);
  const show = await MovieService.findTvSeries(id)
    .then((response) => response.data)
    .catch(() => null);
  if (!show) {
    notFound();
  }
  const detailHref = `/tv-shows/${getSlug(
    show.id,
    show.title ?? show.name ?? 'show',
  )}`;
  const watchHref = `/watch/tv/${params.slug}${
    searchParams?.provider ? `?provider=${searchParams.provider}` : ''
  }`;
  const nextProviderHref = nextProviderId
    ? `/watch/tv/${params.slug}?provider=${nextProviderId}`
    : undefined;

  return (
    <WatchRouteActivator
      config={{
        url: currentProvider.url,
        title: show.title ?? show.name ?? 'TV Show',
        providerLabel: currentProvider.label,
        backHref: detailHref,
        nextProviderHref,
        watchHref,
        show,
      }}
    />
  );
}
