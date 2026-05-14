import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_TMDB_TOKEN = 'test-token';
process.env.NEXT_PUBLIC_SITE_NAME = 'MovieKo';

const { buildSlug, extractIdFromSlug, buildShowHref, buildWatchHref } =
  await import('../src/lib/routes-core.ts');

test('slug helpers round-trip a title and id', () => {
  const slug = buildSlug(1439930, 'The Electric State');
  assert.equal(extractIdFromSlug(slug), 1439930);
});

test('detail route builder uses media type', () => {
  const href = buildShowHref({
    id: 99,
    mediaType: 'tv',
    title: null,
    name: 'Signal',
  });
  assert.match(href, /^\/tv-shows\/signal-99$/);
});

test('watch route builder keeps optional provider query', () => {
  const href = buildWatchHref(
    {
      id: 42,
      mediaType: 'movie',
      title: 'Heat',
      name: null,
    },
    'backup',
  );
  assert.equal(href, '/watch/movie/heat-42?provider=backup');
});
