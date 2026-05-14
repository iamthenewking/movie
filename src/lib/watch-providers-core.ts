export type WatchProviderIdCore = 'primary' | 'backup';

export type WatchProviderCore = {
  id: WatchProviderIdCore;
  label: string;
  template: string;
};

export function buildProviderUrl(
  template: string,
  input: { id: number; mediaType: 'movie' | 'tv' },
) {
  return template
    .replaceAll('{type}', input.mediaType)
    .replaceAll('{id}', String(input.id));
}

export function resolveProviderList(
  providers: WatchProviderCore[],
  input: { id: number; mediaType: 'movie' | 'tv' },
) {
  return providers.map((provider) => ({
    ...provider,
    url: buildProviderUrl(provider.template, input),
  }));
}

export function getNextProviderId(
  providers: WatchProviderCore[],
  currentProviderId?: string,
) {
  const currentIndex = providers.findIndex(
    (provider) => provider.id === currentProviderId,
  );
  if (currentIndex === -1) {
    return providers[1]?.id;
  }
  return providers[currentIndex + 1]?.id;
}
