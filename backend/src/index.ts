import { config } from 'dotenv';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './trpc/root.js';
import { createTRPCContext } from './trpc/context.js';

config();

const port = Number(process.env.PORT) || 3000;

const server = createHTTPServer({
  router: appRouter,
  createContext: createTRPCContext,
});

server.listen(port);

console.log(`tRPC server listening on http://localhost:${port}`);

export type AppRouter = typeof appRouter;
