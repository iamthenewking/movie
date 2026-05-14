'use client';

import { useSearchStore } from '@/stores/search';
import type { CategorizedShows } from '@/types';

import ShowModal from '@/components/shows-modal';
import ShowsCarousel from '@/components/shows-carousel';
import ShowsGrid from '@/components/shows-grid';
import { useModalStore } from '@/stores/modal';
import PersonalizedShelves from '@/components/personalized-shelves';

interface ShowsContainerProps {
  shows: CategorizedShows[];
}

const ShowsContainer = ({ shows }: ShowsContainerProps) => {
  // stores
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  if (searchStore.query.length > 0) {
    return <ShowsGrid shows={searchStore.shows} query={searchStore.query} />;
  }

  const visibleShows = shows.filter(
    (item) => item.visible && item.shows.length,
  );

  return (
    <>
      {modalStore.open && <ShowModal />}
      <PersonalizedShelves />
      {visibleShows.length ? (
        visibleShows.map((item) => (
          <ShowsCarousel
            key={item.title}
            title={item.title}
            shows={item.shows ?? []}
          />
        ))
      ) : (
        <section className="px-[4%] py-12 text-center text-sm text-muted-foreground">
          No curated shelves are available right now. Try refreshing in a
          moment.
        </section>
      )}
    </>
  );
};

export default ShowsContainer;
