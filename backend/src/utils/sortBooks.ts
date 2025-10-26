export type BookSort = 'popular' | 'rating' | 'new';

type SortableBook = {
  reviewsCount: number;
  rating: { average: number; votes: number };
  publishedAt?: string;
};

function byPopular(a: SortableBook, b: SortableBook): number {
  return b.reviewsCount - a.reviewsCount;
}

function byRating(a: SortableBook, b: SortableBook): number {
  if (b.rating.average === a.rating.average) {
    return b.rating.votes - a.rating.votes;
  }

  return b.rating.average - a.rating.average;
}

function byNew(a: SortableBook, b: SortableBook): number {
  const getTime = (book: SortableBook) => (book.publishedAt ? Date.parse(book.publishedAt) : 0);

  return getTime(b) - getTime(a);
}

const comparators: Record<BookSort, (a: SortableBook, b: SortableBook) => number> = {
  popular: byPopular,
  rating: byRating,
  new: byNew,
};

export function sortBooks<T extends SortableBook>(books: T[], sort: BookSort): T[] {
  return [...books].sort(comparators[sort]);
}
