import { config } from 'dotenv';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { requireTestEnv } from './middlewares/testEnv.js';
import { purchasesRoutes } from './routes/purchases.js';
import { starsRoutes } from './routes/stars.js';
import { jsonError } from './utils/jsonError.js';

config();

const app = new Hono();

app.use('/api/*', requireTestEnv);

app.route('/', purchasesRoutes);
app.route('/', starsRoutes);

app.notFound((c) => jsonError(c, 404, 'Not Found'));

app.onError((err, c) => {
  console.error(err);
  return jsonError(c, 500, 'Internal Server Error');
});

const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on http://localhost:${port}`);
