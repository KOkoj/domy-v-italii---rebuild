import type { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { ok } from '../utils/response.js';
import { parsePagination, withPaginationMeta } from '../utils/pagination.js';
import { hashPassword } from '../utils/password.js';
import type { AuthRequest } from '../middlewares/auth.js';

export async function listUsers(req: AuthRequest, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const [total, items] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, isActive: true, avatar: true, createdAt: true, updatedAt: true },
    }),
  ]);
  return ok(res, withPaginationMeta(items, total, page, limit));
}

export async function getUser(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true, avatar: true, createdAt: true, updatedAt: true },
  });
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return ok(res, user);
}

export async function createUser(req: AuthRequest, res: Response) {
  const body = req.body as { email: string; name: string; password: string; role?: string; isActive?: boolean };
  const hash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: hash,
      role: (body.role as any) || 'EMPLOYEE',
      isActive: body.isActive ?? true,
    },
    select: { id: true, email: true, name: true, role: true, isActive: true, avatar: true, createdAt: true, updatedAt: true },
  });
  return ok(res, user, 'User created');
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const body = req.body as Partial<{ email: string; name: string; password: string; role: string; isActive: boolean; avatar: string }>;
  const data: any = { ...body };
  if (body.password) data.password = await hashPassword(body.password);
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, isActive: true, avatar: true, createdAt: true, updatedAt: true },
  });
  return ok(res, user, 'User updated');
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.user.delete({ where: { id } });
  return ok(res, { id }, 'User deleted');
}

export async function updateMyProfile(req: AuthRequest, res: Response) {
  const id = req.user!.id;
  const body = req.body as Partial<{ name: string; password: string; avatar: string }>;
  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.avatar) data.avatar = body.avatar;
  if (body.password) data.password = await hashPassword(body.password);
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, isActive: true, avatar: true, createdAt: true, updatedAt: true },
  });
  return ok(res, user, 'Profile updated');
}
