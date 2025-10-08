import type { MiddlewareHandler } from 'hono';
import { jsonError } from '../utils/jsonError.js';

const REQUIRED_VALUE = 'true';

export const requireTestEnv: MiddlewareHandler = async (c, next) => {
  const headerValue = c.req.header('x-test-env');

  if (headerValue?.toLowerCase() !== REQUIRED_VALUE) {
    return jsonError(c, 400, 'X-Test-Env header required for testnet');
  }

  await next();
};
