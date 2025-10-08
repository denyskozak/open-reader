import { z } from 'zod';

export const bookIdParam = z.object({
  bookId: z.string().min(1),
});

export const CreateInvoiceBody = z.object({
  bookId: z.string().min(1),
});

export const ConfirmPurchaseBody = z.object({
  bookId: z.string().min(1),
  payment_id: z.string().min(1),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceBody>;
export type ConfirmPurchaseInput = z.infer<typeof ConfirmPurchaseBody>;
