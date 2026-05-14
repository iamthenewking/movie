import test from 'node:test';
import assert from 'node:assert/strict';

const { buildProviderUrl, getNextProviderId, resolveProviderList } =
  await import('../src/lib/watch-providers-core.ts');

const providers = [
  {
    id: 'primary',
    label: 'VidSrc',
    template: 'https://vidsrc.cc/v2/embed/{type}/{id}',
  },
  {
    id: 'backup',
    label: 'Backup',
    template: 'https://backup.example/embed/{type}/{id}',
  },
];

test('watch providers resolve primary and configured backup sources', () => {
  const resolved = resolveProviderList(providers, {
    id: 77,
    mediaType: 'movie',
  });
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].url, 'https://vidsrc.cc/v2/embed/movie/77');
  assert.equal(resolved[1].url, 'https://backup.example/embed/movie/77');
});

test('current provider and next provider id are resolved consistently', () => {
  assert.equal(
    buildProviderUrl('https://source.example/{type}/{id}', {
      id: 12,
      mediaType: 'tv',
    }),
    'https://source.example/tv/12',
  );
  assert.equal(getNextProviderId(providers, 'primary'), 'backup');
  assert.equal(getNextProviderId(providers, 'backup'), undefined);
});
