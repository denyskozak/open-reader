import booksData from "@/mocks/books.json";
import type { Book } from "./types";

export const TOTAL_BOOKS_COUNT = (booksData as unknown as Book[]).length;
