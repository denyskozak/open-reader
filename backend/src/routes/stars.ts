import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreateInvoiceBody } from '../schemas/index.js';
import { createInvoice } from '../lib/invoice.js';
import { jsonError } from '../utils/jsonError.js';

export const starsRoutes = new Hono();

starsRoutes.post(
  '/api/stars/invoice',
  zValidator('json', CreateInvoiceBody, (result, c) => {
    if (!result.success) {
      return jsonError(c, 422, 'ValidationError', result.error.issues);
    }
  }),
  (c) => {
    const body = c.req.valid('json');
    const invoice = createInvoice(body.bookId);
    return c.json(invoice);
  },
);
