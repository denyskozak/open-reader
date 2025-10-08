import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { bookIdParam, ConfirmPurchaseBody } from '../schemas/index.js';
import { getPurchased, setPurchased } from '../stores/purchasesStore.js';
import { jsonError } from '../utils/jsonError.js';

export const purchasesRoutes = new Hono();

purchasesRoutes.get(
  '/api/purchases/:bookId',
  zValidator('param', bookIdParam, (result, c) => {
    if (!result.success) {
      return jsonError(c, 422, 'ValidationError', result.error.issues);
    }
  }),
  (c) => {
    const { bookId } = c.req.valid('param');
    const purchased = getPurchased(bookId);
    return c.json({ purchased });
  },
);

purchasesRoutes.post(
  '/api/purchases/confirm',
  zValidator('json', ConfirmPurchaseBody, (result, c) => {
    if (!result.success) {
      return jsonError(c, 422, 'ValidationError', result.error.issues);
    }
  }),
  (c) => {
    const body = c.req.valid('json');
    setPurchased(body.bookId, true);
    return c.json({ ok: true });
  },
);
