import { type Metadata } from 'next';
import { handleMetadata } from '@/lib/utils';
import { getIdFromSlug } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import ShowDetailPage from '@/components/show-detail-page';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return handleMetadata(params.slug, 'movies', 'movie');
}

export default async function MovieDetailsPage({ params }: Props) {
  const id = getIdFromSlug(params.slug);
  if (!id) {
    notFound();
  }

  try {
    const show = await MovieService.findShowDetailsByIdAndType(id, 'movie');
    show.media_type = show.media_type || 'movie';
    return <ShowDetailPage show={show} />;
  } catch {
    notFound();
  }
}
