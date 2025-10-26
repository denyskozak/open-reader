import { z } from 'zod';
import { createRouter, procedure } from '../trpc/trpc.js';
import { createInvoice } from '../payments/invoice.js';

const createInvoiceInput = z.object({
  bookId: z.string().trim().min(1),
});

export const paymentsRouter = createRouter({
  createInvoice: procedure.input(createInvoiceInput).mutation(({ input }) => createInvoice(input.bookId)),
});
