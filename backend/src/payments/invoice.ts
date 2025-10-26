import { randomUUID } from 'crypto';

export type Invoice = {
  paymentId: string;
  invoiceLink: string;
};

export const createInvoice = (bookId: string): Invoice => {
  const paymentId = randomUUID();
  return {
    paymentId,
    invoiceLink: `https://t.me/test-stars-invoice/${bookId}/${paymentId}`,
  };
};
