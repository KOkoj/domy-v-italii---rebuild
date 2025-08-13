import type { NextFunction, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { fail } from '../utils/response.js';
import type { AuthRequest } from './auth.js';
import type { Role } from '@prisma/client';

export function authorize(...roles: Role[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return fail(res, 'Unauthorized', undefined, 401);
      }

      // Fetch user with role from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, role: true, isActive: true }
      });

      if (!user) {
        return fail(res, 'User not found', undefined, 401);
      }

      if (!user.isActive) {
        return fail(res, 'Account disabled', undefined, 403);
      }

      if (!roles.includes(user.role)) {
        return fail(res, 'Insufficient permissions', undefined, 403);
      }

      // Add user role to request for further use
      req.user = { id: user.id, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };
}
