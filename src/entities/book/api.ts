import enCategoriesData from "@/mocks/categories.en.json";
import ruCategoriesData from "@/mocks/categories.ru.json";
import enBooksData from "@/mocks/books.en.json";
import ruBooksData from "@/mocks/books.ru.json";
import enReviewsData from "@/mocks/reviews.en.json";
import ruReviewsData from "@/mocks/reviews.ru.json";

import type { Category } from "@/entities/category/types";

import type { Book, CatalogApi, ID, Review } from "./types";
import { sortBooks } from "@/shared/lib/bookSort";
import i18n, { SUPPORTED_LANGUAGES } from "@/shared/config/i18n";

const MIN_DELAY = 300;
const MAX_DELAY = 600;
const DEFAULT_PAGE_SIZE = 10;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

type RawBook = Omit<Book, "priceStars"> & { priceStars?: number };

const rawCategoriesByLanguage: Record<SupportedLanguage, Category[]> = {
  en: enCategoriesData as Category[],
  ru: ruCategoriesData as Category[],
};

const rawBooksByLanguage: Record<SupportedLanguage, RawBook[]> = {
  en: enBooksData as RawBook[],
  ru: ruBooksData as RawBook[],
};

const rawReviewsByLanguage: Record<SupportedLanguage, Review[]> = {
  en: enReviewsData as Review[],
  ru: ruReviewsData as Review[],
};

const booksCache = new Map<SupportedLanguage, Book[]>();
const categoryTagCache = new Map<string, string[]>();

function normalizeLanguage(language?: string): SupportedLanguage {
  const normalized = language?.slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)
    ? (normalized as SupportedLanguage)
    : "en";
}

function resolveLanguage(language?: string): SupportedLanguage {
  return normalizeLanguage(language ?? i18n.language);
}

function buildBooks(language: SupportedLanguage): Book[] {
  const source = rawBooksByLanguage[language];

  return source.map((item, index) => {
    const baseRating = Math.max(1, Math.round(item.rating.average));
    const fallbackPrice = Math.min(10, baseRating + 3 + (index % 3));

    return {
      ...item,
      priceStars: item.priceStars ?? fallbackPrice,
    };
  });
}

function getBooks(language?: string): Book[] {
  const resolved = resolveLanguage(language);

  if (!booksCache.has(resolved)) {
    booksCache.set(resolved, buildBooks(resolved));
  }

  return booksCache.get(resolved) ?? [];
}

function getCategories(language?: string): Category[] {
  return rawCategoriesByLanguage[resolveLanguage(language)];
}

function getReviews(language?: string): Review[] {
  return rawReviewsByLanguage[resolveLanguage(language)];
}

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

function filterBooks(source: Book[], params: {
  categoryId?: ID;
  search?: string;
  tags?: string[];
}): Book[] {
  return source.filter((book) => {
    const categoryMatch = params.categoryId
      ? book.categories.includes(params.categoryId)
      : true;
    return categoryMatch && matchesSearch(book, params.search) && matchesTags(book, params.tags);
  });
}

export function getCategoryTags(categoryId: ID, language?: string): string[] {
  const resolvedLanguage = resolveLanguage(language);
  const cacheKey = `${resolvedLanguage}:${categoryId}`;

  if (categoryTagCache.has(cacheKey)) {
    return categoryTagCache.get(cacheKey) ?? [];
  }

  const relatedBooks = getBooks(resolvedLanguage).filter((book) =>
    book.categories.includes(categoryId),
  );
  const uniqueTags = Array.from(new Set(relatedBooks.flatMap((book) => book.tags)));

  for (let i = uniqueTags.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniqueTags[i], uniqueTags[j]] = [uniqueTags[j], uniqueTags[i]];
  }

  const tags = uniqueTags.slice(0, 9);
  categoryTagCache.set(cacheKey, tags);
  return tags;
}

export function createMockCatalogApi(): CatalogApi {
  return {
    async listCategories(query) {
      await delay();
      const language = resolveLanguage();
      const categories = getCategories(language);
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
      const language = resolveLanguage();
      const books = getBooks(language);
      const filtered = filterBooks(books, { categoryId, search, tags });
      const sorted = sortBooks(filtered, sort);

      const start = parseCursor(cursor);
      const end = start + limit;
      const slice = sorted.slice(start, end);
      const nextCursor = end < sorted.length ? buildCursor(end) : undefined;

      return { items: slice, nextCursor };
    },
    async getBook(id) {
      await delay();
      const language = resolveLanguage();
      const book = getBooks(language).find((item) => item.id === id);

      if (!book) {
        throw new Error(language === "ru" ? "Книга не найдена" : "Book not found");
      }

      return book;
    },
    async listReviews(bookId, cursor, limit = DEFAULT_PAGE_SIZE) {
      await delay();
      const language = resolveLanguage();
      const reviews = getReviews(language);
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
