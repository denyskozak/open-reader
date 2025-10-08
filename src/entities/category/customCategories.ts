import type { Category } from "./types";
import type { BookSort } from "@/shared/lib/bookSort";
import { TOTAL_BOOKS_COUNT } from "@/entities/book/constants";

const SPECIAL_CATEGORIES_BASE = [
  {
    id: "most-read",
    title: "Самые читаемые",
    slug: "most-read",
    emoji: "📖",
    sort: "popular" as const,
  },
  {
    id: "top-rated",
    title: "Самые рейтинговые",
    slug: "top-rated",
    emoji: "⭐",
    sort: "rating" as const,
  },
] as const;

export type SpecialCategoryId = (typeof SPECIAL_CATEGORIES_BASE)[number]["id"];
export type SpecialCategory = Category & { id: SpecialCategoryId; sort: BookSort; path: string };

export const SPECIAL_CATEGORIES: SpecialCategory[] = SPECIAL_CATEGORIES_BASE.map((category) => ({
  ...category,
  booksCount: TOTAL_BOOKS_COUNT,
  path: `/top/${category.slug}`,
})) satisfies SpecialCategory[];

export const SPECIAL_CATEGORY_MAP: Record<SpecialCategoryId, SpecialCategory> = Object.fromEntries(
  SPECIAL_CATEGORIES.map((category) => [category.id, category]),
) as Record<SpecialCategoryId, SpecialCategory>;

export function isSpecialCategoryId(value: string): value is SpecialCategoryId {
  return value in SPECIAL_CATEGORY_MAP;
}
