import type { Context } from 'hono';

export const jsonError = <T>(
  c: Context,
  status: number,
  message: string,
  details?: T,
) => {
  c.status(status);
  return c.json({ error: message, ...(details ? { details } : {}) });
};
