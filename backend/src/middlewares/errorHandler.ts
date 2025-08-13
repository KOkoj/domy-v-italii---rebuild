import type { NextFunction, Request, Response } from 'express';
import { fail } from '../utils/response.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return fail(res, message, process.env.NODE_ENV !== 'production' ? err.stack : undefined, status);
}
