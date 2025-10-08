import { randomUUID } from 'crypto';

export type Invoice = {
  invoice_link: string;
  payment_id: string;
};

export const createInvoice = (_bookId: string): Invoice => {
  const payment_id = randomUUID();
  return {
    payment_id,
    invoice_link: `https://t.me/test-stars-invoice/${payment_id}`,
  };
};
