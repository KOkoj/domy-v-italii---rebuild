import type { Request, Response } from 'express';
import { fail } from '../utils/response.js';

export function notFound(_req: Request, res: Response) {
  return fail(res, 'Not Found', undefined, 404);
}
