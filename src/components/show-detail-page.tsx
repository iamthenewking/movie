import Link from 'next/link';
import { PlayCircle, Star } from 'lucide-react';
import CustomImage from '@/components/custom-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  type CastMember,
  MediaType,
  type Show,
  type ShowDetails,
} from '@/types';
import {
  formatRuntime,
  formatDate,
  getNameFromShow,
  getReleaseYear,
  getShowHref,
  getWatchHref,
} from '@/lib/utils';
import ShowPersonalizationTools from '@/components/show-personalization-tools';

interface ShowDetailPageProps {
  show: ShowDetails;
}

function buildRelatedTitles(show: ShowDetails): Show[] {
  const pool = [
    ...(show.recommendations?.results ?? []),
    ...(show.similar?.results ?? []),
  ];
  const unique = new Map<number, Show>();
  pool.forEach((item) => {
    if (!unique.has(item.id) && item.id !== show.id) {
      unique.set(item.id, item);
    }
  });
  return Array.from(unique.values()).slice(0, 12);
}

function getTrailerLink(show: ShowDetails) {
  const trailer = show.videos?.results?.find(
    (item) => item.site === 'YouTube' && item.type === 'Trailer',
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

function CastCard({ cast }: { cast: CastMember }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="relative aspect-[3/4]">
        <CustomImage
          src={
            cast.profile_path
              ? `https://image.tmdb.org/t/p/w500${cast.profile_path}`
              : '/images/grey-thumbnail.jpg'
          }
          alt={cast.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 40vw, 16vw"
        />
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-1 text-sm font-semibold">{cast.name}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {cast.character ?? cast.known_for_department ?? 'Cast'}
        </p>
      </div>
    </article>
  );
}

function RelatedCard({ show }: { show: Show }) {
  return (
    <Link
      href={getShowHref(show)}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/[0.08]">
      <div className="relative aspect-[2/3]">
        <CustomImage
          src={
            show.poster_path ?? show.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${
                  show.poster_path ?? show.backdrop_path
                }`
              : '/images/grey-thumbnail.jpg'
          }
          alt={getNameFromShow(show)}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 40vw, 16vw"
        />
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold">
            {getNameFromShow(show)}
          </p>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {show.media_type === MediaType.TV ? 'TV' : 'Movie'}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {show.overview ?? 'Open details and start watching.'}
        </p>
      </div>
    </Link>
  );
}

export default function ShowDetailPage({ show }: ShowDetailPageProps) {
  const trailerLink = getTrailerLink(show);
  const related = buildRelatedTitles(show);
  const cast = (show.credits?.cast ?? []).slice(0, 8);
  const rating = Math.round((show.vote_average ?? 0) * 10);
  const year = getReleaseYear(show);
  const runtime = formatRuntime(show.runtime);

  return (
    <div className="pb-16">
      <section className="relative min-h-[78vh] overflow-hidden">
        <div className="absolute inset-0">
          <CustomImage
            src={
              show.backdrop_path ?? show.poster_path
                ? `https://image.tmdb.org/t/p/original${
                    show.backdrop_path ?? show.poster_path
                  }`
                : '/images/hero.jpg'
            }
            alt={getNameFromShow(show)}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.55),rgba(0,0,0,0.75))]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl items-end px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/60">
              <span>
                {show.media_type === MediaType.TV ? 'Series' : 'Movie'}
              </span>
              {year ? <span>{year}</span> : null}
              {runtime ? <span>{runtime}</span> : null}
              <span className="inline-flex items-center gap-1 text-white/80">
                <Star className="h-3.5 w-3.5 fill-current" />
                {rating}% Match
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {getNameFromShow(show)}
              </h1>
              {show.tagline ? (
                <p className="text-base italic text-white/70 sm:text-lg">
                  {show.tagline}
                </p>
              ) : null}
              <p className="text-white/78 max-w-2xl text-sm leading-7 sm:text-base">
                {show.overview ?? 'No overview available yet for this title.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={getWatchHref(show)}>
                <Button className="h-auto rounded-full px-5 py-3 text-sm font-semibold">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start watching
                </Button>
              </Link>
              <ShowPersonalizationTools show={show} />
              {trailerLink ? (
                <Link href={trailerLink} target="_blank" rel="noreferrer">
                  <Button
                    variant="outline"
                    className="border-white/15 h-auto rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:text-white">
                    Watch trailer
                  </Button>
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {(show.genres ?? []).map((genre) =>
                genre.name ? (
                  <Badge
                    key={genre.id}
                    variant="secondary"
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/10">
                    {genre.name}
                  </Badge>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Why watch this</h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {show.overview ??
                'This title does not have a published overview yet.'}
            </p>
            {show.release_date ?? show.first_air_date ? (
              <p className="text-sm text-muted-foreground">
                Released{' '}
                {formatDate(show.release_date ?? show.first_air_date ?? '')}
              </p>
            ) : null}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">Quick facts</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Language</dt>
                <dd className="text-right uppercase">
                  {show.original_language ?? '-'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-right">{show.status ?? '-'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Votes</dt>
                <dd className="text-right">
                  {show.vote_count?.toLocaleString() ?? '-'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Seasons</dt>
                <dd className="text-right">{show.number_of_seasons ?? '-'}</dd>
              </div>
            </dl>
          </div>
        </section>

        {cast.length ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Top cast</h2>
                <p className="text-sm text-muted-foreground">
                  The faces you are about to watch.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
              {cast.map((member) => (
                <CastCard key={member.id} cast={member} />
              ))}
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">More like this</h2>
              <p className="text-sm text-muted-foreground">
                Keep exploring without dropping back to the home feed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {related.map((item) => (
                <RelatedCard
                  key={`${item.media_type}-${item.id}`}
                  show={item}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
