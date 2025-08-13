import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { fail } from '../utils/response.js';

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return fail(res, 'Validation failed', { errors }, 400);
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return fail(res, 'Query validation failed', { errors }, 400);
      }

      req.query = result.data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return fail(res, 'Parameter validation failed', { errors }, 400);
      }

      req.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
