import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, procedure } from '../trpc/trpc.js';
import {
  getBook,
  listBooks,
  listCategories,
  listCategoryTags,
  listReviews,
} from '../data/catalog.js';

const listCategoriesInput = z.object({
  search: z.string().trim().optional(),
});

const listBooksInput = z.object({
  categoryId: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
  sort: z.enum(['popular', 'rating', 'new']).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  cursor: z.string().trim().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

const getBookInput = z.object({
  id: z.string().trim().min(1),
});

const listReviewsInput = z.object({
  bookId: z.string().trim().min(1),
  cursor: z.string().trim().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

const listCategoryTagsInput = z.object({
  categoryId: z.string().trim().min(1),
  limit: z.number().int().min(1).max(20).optional(),
});

export const catalogRouter = createRouter({
  listCategories: procedure
    .input(listCategoriesInput.optional())
    .query(({ input }) => listCategories(input?.search)),
  listBooks: procedure
    .input(listBooksInput.optional())
    .query(({ input }) => listBooks(input ?? {})),
  getBook: procedure.input(getBookInput).query(({ input }) => {
    const book = getBook(input.id);
    if (!book) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Book not found' });
    }

    return book;
  }),
  listReviews: procedure.input(listReviewsInput).query(({ input }) => listReviews(input.bookId, input)),
  listCategoryTags: procedure
    .input(listCategoryTagsInput)
    .query(({ input }) => listCategoryTags(input.categoryId, input.limit)),
});
