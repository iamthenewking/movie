import { env } from '@/env.mjs';
import { MediaType } from '@/types';
import {
  getNextProviderId,
  resolveProviderList,
  type WatchProviderCore,
} from '@/lib/watch-providers-core';

export type WatchProviderId = 'primary' | 'backup';

export type WatchProvider = {
  id: WatchProviderId;
  label: string;
  template: string;
};

export type ResolvedWatchProvider = WatchProvider & {
  url: string;
};

function createConfiguredProvider(
  id: WatchProviderId,
  fallbackLabel: string,
  fallbackTemplate: string,
  label?: string,
  template?: string,
): WatchProvider {
  return {
    id,
    label: label?.trim() ?? fallbackLabel,
    template: template?.trim() ?? fallbackTemplate,
  };
}

export function getWatchProviders(): WatchProvider[] {
  const providers: WatchProviderCore[] = [
    createConfiguredProvider(
      'primary',
      'VidSrc',
      'https://vidsrc.cc/v2/embed/{type}/{id}',
      env.NEXT_PUBLIC_WATCH_PROVIDER_PRIMARY_LABEL,
      env.NEXT_PUBLIC_WATCH_PROVIDER_PRIMARY_TEMPLATE,
    ),
  ];

  if (env.NEXT_PUBLIC_WATCH_PROVIDER_BACKUP_TEMPLATE?.trim()) {
    providers.push(
      createConfiguredProvider(
        'backup',
        'Backup Source',
        env.NEXT_PUBLIC_WATCH_PROVIDER_BACKUP_TEMPLATE,
        env.NEXT_PUBLIC_WATCH_PROVIDER_BACKUP_LABEL,
        env.NEXT_PUBLIC_WATCH_PROVIDER_BACKUP_TEMPLATE,
      ),
    );
  }

  return providers;
}

export function resolveWatchProviders(input: {
  mediaType: MediaType;
  id: number;
}): ResolvedWatchProvider[] {
  return resolveProviderList(getWatchProviders(), {
    id: input.id,
    mediaType: input.mediaType === MediaType.TV ? 'tv' : 'movie',
  });
}

export function resolveCurrentWatchProvider(input: {
  mediaType: MediaType;
  id: number;
  providerId?: string;
}): ResolvedWatchProvider {
  const providers = resolveWatchProviders(input);
  const selected = providers.find(
    (provider) => provider.id === input.providerId,
  );
  return selected ?? providers[0];
}

export function getNextWatchProviderId(currentProviderId?: string) {
  return getNextProviderId(getWatchProviders(), currentProviderId);
}
