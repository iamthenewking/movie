import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_TMDB_TOKEN = 'test-token';
process.env.NEXT_PUBLIC_SITE_NAME = 'MovieKo';

const {
  applySearchFilters,
  deriveGenreOptions,
  deriveLanguageOptions,
  deriveYearOptions,
} = await import('../src/lib/search-discovery-core.ts');

const sampleShows = [
  {
    id: 1,
    media_type: 'movie',
    title: 'Heat',
    name: null,
    overview: null,
    poster_path: null,
    backdrop_path: null,
    vote_average: 8,
    release_date: '1995-12-15',
    first_air_date: null,
    original_language: 'en',
    genre_ids: [28, 80],
  },
  {
    id: 2,
    media_type: 'tv',
    title: null,
    name: 'Kingdom',
    overview: null,
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.5,
    release_date: null,
    first_air_date: '2019-01-25',
    original_language: 'ko',
    genre_ids: [18, 53],
  },
];

test('search filters can isolate tv entries by language and year', () => {
  const filtered = applySearchFilters(sampleShows, {
    mediaType: 'tv',
    genreId: 'all',
    year: '2019',
    language: 'KO',
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Kingdom');
});

test('genre, year, and language options are derived from results', () => {
  const genres = deriveGenreOptions(sampleShows, [
    ['ACTION', 28],
    ['CRIME', 80],
    ['DRAMA', 18],
    ['THRILLER', 53],
  ]);
  const years = deriveYearOptions(sampleShows);
  const languages = deriveLanguageOptions(sampleShows);

  assert.ok(genres.some((item) => item.value === '28'));
  assert.deepEqual(years, ['2019', '1995']);
  assert.deepEqual(languages, ['EN', 'KO']);
});
