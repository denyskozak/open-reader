import { z } from 'zod';
import { createRouter, procedure } from '../trpc/trpc.js';
import {
  getPurchaseDetails,
  getPurchased,
  listPurchasedBooks,
  setPurchased,
} from '../stores/purchasesStore.js';

const bookIdInput = z.object({
  bookId: z.string().trim().min(1),
});

const confirmPurchaseInput = bookIdInput.extend({
  paymentId: z.string().trim().min(1),
});

export const purchasesRouter = createRouter({
  getStatus: procedure.input(bookIdInput).query(({ input }) => ({
    purchased: getPurchased(input.bookId),
    details: getPurchaseDetails(input.bookId) ?? null,
  })),
  confirm: procedure.input(confirmPurchaseInput).mutation(({ input }) => {
    setPurchased(input.bookId, input.paymentId);
    return { ok: true };
  }),
  list: procedure.query(() => ({ items: listPurchasedBooks() })),
});
