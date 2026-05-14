'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getShowHref } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { useSearchStore } from '@/stores/search';
import { type Show } from '@/types';
import Link from 'next/link';
import React from 'react';
import CustomImage from './custom-image';
import Youtube from 'react-youtube';
import {
  MediaType,
  type ShowWithGenreAndVideo,
  type VideoResult,
} from '@/types';

interface HeroProps {
  randomShow: Show | null;
}

const Hero = ({ randomShow }: HeroProps) => {
  const [trailer, setTrailer] = React.useState('');

  React.useEffect(() => {
    if (!randomShow?.id) {
      return;
    }
    const type = randomShow.media_type === MediaType.TV ? 'tv' : 'movie';
    MovieService.findMovieByIdAndType(randomShow.id, type)
      .then((data: ShowWithGenreAndVideo) => {
        const result = data.videos?.results?.find(
          (item: VideoResult) => item.type === 'Trailer',
        );
        if (result?.key) {
          setTrailer(result.key);
        }
      })
      .catch(() => setTrailer(''));
  }, [randomShow?.id, randomShow?.media_type]);

  // stores
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  if (searchStore.query.length > 0) {
    return null;
  }

  return (
    <section aria-label="Hero" className="w-full">
      {randomShow && (
        <>
          <div className="absolute inset-0 z-0 h-[100vw] w-full sm:h-[56.25vw]">
            {trailer ? (
              <Youtube
                videoId={trailer}
                title={`${
                  randomShow?.title ?? randomShow?.name ?? 'show'
                } trailer`}
                opts={{
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                    mute: 1,
                    loop: 1,
                    playlist: trailer,
                    rel: 0,
                    playsinline: 1,
                    modestbranding: 1,
                  },
                }}
                className="absolute inset-0 z-0 h-full w-full"
                iframeClassName="h-full w-full scale-[1.35] object-cover opacity-45"
              />
            ) : null}
            <CustomImage
              src={`https://image.tmdb.org/t/p/original${
                randomShow?.backdrop_path ?? randomShow?.poster_path ?? ''
              }`}
              alt={randomShow?.title ?? 'poster'}
              className={`-z-40 h-auto w-full object-cover transition-opacity duration-500 ${
                trailer ? 'opacity-35' : 'opacity-100'
              }`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
              fill
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 top-0">
              <div className="absolute bottom-[35%] left-[4%] top-0 z-10 flex w-[36%] flex-col justify-end space-y-2">
                <h1 className="text-[3vw] font-bold">
                  {randomShow?.title ?? randomShow?.name}
                </h1>
                <div className="flex space-x-2 text-[2vw] font-semibold md:text-[1.2vw]">
                  <p className="text-green-600">
                    {Math.round(randomShow?.vote_average * 10) ?? '-'}% Match
                  </p>
                  {/* <p className="text-gray-300">{randomShow?.release_date ?? "-"}</p> */}
                  <p>{randomShow?.release_date ?? '-'}</p>
                </div>
                {/* <p className="line-clamp-4 text-sm text-gray-300 md:text-base"> */}
                <p className="hidden text-[1.2vw] sm:line-clamp-3">
                  {randomShow?.overview ?? '-'}
                </p>
                <div className="mt-[1.5vw] flex items-center space-x-2">
                  <Link prefetch={false} href={getShowHref(randomShow)}>
                    <Button
                      aria-label="View show details"
                      className="h-auto flex-shrink-0 gap-2 rounded-xl">
                      <Icons.play className="fill-current" aria-hidden="true" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    aria-label="Open show's details modal"
                    variant="outline"
                    className="h-auto flex-shrink-0 gap-2 rounded-xl"
                    onClick={() => {
                      modalStore.setShow(randomShow);
                      modalStore.setOpen(true);
                      modalStore.setPlay(true);
                    }}>
                    <Icons.info aria-hidden="true" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>{' '}
            <div className="opacity-71 absolute inset-0 right-[26.09%] z-[8] bg-gradient-to-r from-secondary to-85%"></div>
            <div className="absolute bottom-[-1px] left-0 right-0 z-[8] h-[14.7vw] bg-gradient-to-b from-background/0 from-30% via-background/30 via-50% to-background to-80%"></div>
          </div>
          <div className="relative inset-0 -z-50 mb-5 pb-[60%] sm:pb-[40%]"></div>
        </>
      )}
    </section>
  );
};

export default Hero;
