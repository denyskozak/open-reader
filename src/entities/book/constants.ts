import ruBooksData from "@/mocks/books.ru.json";

import type { Book } from "./types";

export const TOTAL_BOOKS_COUNT = (ruBooksData as unknown as Book[]).length;
