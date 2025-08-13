import type { Response } from 'express';

export const ok = <T>(res: Response, data: T, message?: string) =>
  res.json({ success: true, data, ...(message ? { message } : {}) });

export const fail = (res: Response, message: string, error?: unknown, status = 400) =>
  res.status(status).json({ success: false, message, ...(error ? { error } : {}) });
