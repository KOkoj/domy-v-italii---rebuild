import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/tokens.js';
import type { Role } from '@prisma/client';

export type AuthRequest = Request & { user?: { id: string; role?: Role } };

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id };
    next();
  } catch {
    const err: any = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }
}


