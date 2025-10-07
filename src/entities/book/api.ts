import categoriesData from "@/mocks/categories.json";
import booksData from "@/mocks/books.json";
import reviewsData from "@/mocks/reviews.json";

import type { Category } from "@/entities/category/types";

import type { Book, CatalogApi, ID, Review } from "./types";
import { sortBooks } from "@/shared/lib/bookSort";

const MIN_DELAY = 300;
const MAX_DELAY = 600;
const DEFAULT_PAGE_SIZE = 10;

const categories: Category[] = categoriesData as Category[];
type RawBook = Omit<Book, "priceStars"> & { priceStars?: number };

const books: Book[] = (booksData as RawBook[]).map((item, index) => {
  const baseRating = Math.max(1, Math.round(item.rating.average));
  const fallbackPrice = Math.min(10, baseRating + 3 + (index % 3));

  return {
    ...item,
    priceStars: item.priceStars ?? fallbackPrice,
  };
});
const reviews: Review[] = reviewsData as Review[];

const categoryTagCache = new Map<ID, string[]>();

function delay(): Promise<void> {
  const timeout = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  return new Promise((resolve) => globalThis.setTimeout(resolve, timeout));
}

function buildCursor(index: number): string {
  return index.toString(10);
}

function parseCursor(cursor?: string): number {
  if (!cursor) {
    return 0;
  }

  const parsed = Number.parseInt(cursor, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeString(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function matchesSearch(book: Book, search?: string): boolean {
  if (!search) {
    return true;
  }

  const normalized = normalizeString(search);
  return [book.title, ...book.authors].some((candidate) =>
    normalizeString(candidate).includes(normalized),
  );
}

function matchesTags(book: Book, tags?: string[]): boolean {
  if (!tags || tags.length === 0) {
    return true;
  }

  return tags.every((tag) => book.tags.includes(tag));
}

function filterBooks(params: {
  categoryId?: ID;
  search?: string;
  tags?: string[];
}): Book[] {
  return books.filter((book) => {
    const categoryMatch = params.categoryId
      ? book.categories.includes(params.categoryId)
      : true;
    return categoryMatch && matchesSearch(book, params.search) && matchesTags(book, params.tags);
  });
}

export function getCategoryTags(categoryId: ID): string[] {
  if (categoryTagCache.has(categoryId)) {
    return categoryTagCache.get(categoryId) ?? [];
  }

  const relatedBooks = books.filter((book) => book.categories.includes(categoryId));
  const tags = Array.from(new Set(relatedBooks.flatMap((book) => book.tags))).sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
  categoryTagCache.set(categoryId, tags);
  return tags;
}

export function createMockCatalogApi(): CatalogApi {
  return {
    async listCategories(query) {
      await delay();
      const search = query?.search?.trim().toLocaleLowerCase();

      if (!search) {
        return categories;
      }

      return categories.filter((category) =>
        category.title.toLocaleLowerCase().includes(search) ||
        category.slug.toLocaleLowerCase().includes(search),
      );
    },
    async listBooks({ categoryId, cursor, limit = DEFAULT_PAGE_SIZE, search, sort = "popular", tags }) {
      await delay();
      const filtered = filterBooks({ categoryId, search, tags });
      const sorted = sortBooks(filtered, sort);

      const start = parseCursor(cursor);
      const end = start + limit;
      const slice = sorted.slice(start, end);
      const nextCursor = end < sorted.length ? buildCursor(end) : undefined;

      return { items: slice, nextCursor };
    },
    async getBook(id) {
      await delay();
      const book = books.find((item) => item.id === id);

      if (!book) {
        throw new Error("Книга не найдена");
      }

      return book;
    },
    async listReviews(bookId, cursor, limit = DEFAULT_PAGE_SIZE) {
      await delay();
      const related = reviews
        .filter((review) => review.bookId === bookId)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

      const start = parseCursor(cursor);
      const end = start + limit;
      const slice = related.slice(start, end);
      const nextCursor = end < related.length ? buildCursor(end) : undefined;

      return { items: slice, nextCursor };
    },
  };
}

export const catalogApi = createMockCatalogApi();
