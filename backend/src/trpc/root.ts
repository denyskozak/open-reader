import { createRouter } from './trpc.js';
import { catalogRouter } from '../routers/catalog.js';
import { purchasesRouter } from '../routers/purchases.js';
import { paymentsRouter } from '../routers/payments.js';

export const appRouter = createRouter({
  catalog: catalogRouter,
  purchases: purchasesRouter,
  payments: paymentsRouter,
});
