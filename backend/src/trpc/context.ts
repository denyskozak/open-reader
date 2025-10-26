import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';

export type TRPCContext = {
  req: CreateHTTPContextOptions['req'];
};

export const createTRPCContext = ({ req }: CreateHTTPContextOptions): TRPCContext => ({
  req,
});
