import type { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { ok } from '../utils/response.js';
import type { AuthRequest } from '../middlewares/auth.js';

export async function getSettings(_req: AuthRequest, res: Response) {
  const items = await prisma.setting.findMany();
  return ok(res, items);
}

export async function putSettings(req: AuthRequest, res: Response) {
  const items = req.body as Array<{ key: string; value: any }>;
  if (!Array.isArray(items)) {
    const err: any = new Error('Invalid payload');
    err.status = 400;
    throw err;
  }
  const ops = items.map((item) =>
    prisma.setting.upsert({
      where: { key: item.key },
      update: { value: item.value as any },
      create: { key: item.key, value: item.value as any },
    }),
  );
  await Promise.all(ops);
  const all = await prisma.setting.findMany();
  return ok(res, all, 'Settings updated');
}
