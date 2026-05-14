type ShowRouteInput = {
  id: number;
  mediaType: string;
  title?: string | null;
  name?: string | null;
};

export function normalizeShowName(input: {
  title?: string | null;
  name?: string | null;
}) {
  return input.name ?? input.title ?? '';
}

export function buildSlug(id: number, name: string): string {
  const regex = /([^\x00-\x7F]|[&$\+,:;=\?@#\s<>\[\]\{\}|\\\^%])+/gm;
  return `${name.toLowerCase().replace(regex, '-')}-${id}`;
}

export function extractIdFromSlug(slug: string): number {
  const id = slug.split('-').pop();
  return id ? parseInt(id, 10) : 0;
}

export function buildShowHref(show: ShowRouteInput): string {
  const path = show.mediaType === 'tv' ? 'tv-shows' : 'movies';
  return `/${path}/${buildSlug(show.id, normalizeShowName(show))}`;
}

export function buildWatchHref(
  show: ShowRouteInput,
  provider?: string,
): string {
  const path = show.mediaType === 'tv' ? 'tv' : 'movie';
  const href = `/watch/${path}/${buildSlug(show.id, normalizeShowName(show))}`;
  return provider ? `${href}?provider=${provider}` : href;
}
