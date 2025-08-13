import type { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { ok } from '../utils/response.js';
import { parsePagination, withPaginationMeta } from '../utils/pagination.js';
import type { AuthRequest } from '../middlewares/auth.js';

export async function createInquiry(req: AuthRequest, res: Response) {
  const body = req.body as any;
  const inquiry = await prisma.inquiry.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      message: body.message,
      propertyId: body.propertyId ?? null,
    },
  });
  return ok(res, inquiry, 'Inquiry submitted');
}

export async function listInquiries(req: AuthRequest, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const [total, items] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return ok(res, withPaginationMeta(items, total, page, limit));
}

export async function getInquiry(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const item = await prisma.inquiry.findUnique({ where: { id } });
  if (!item) {
    const err: any = new Error('Inquiry not found');
    err.status = 404;
    throw err;
  }
  return ok(res, item);
}

export async function updateInquiry(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const body = req.body as any;
  const item = await prisma.inquiry.update({ where: { id }, data: { status: body.status } });
  return ok(res, item, 'Inquiry updated');
}
