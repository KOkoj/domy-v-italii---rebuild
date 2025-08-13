import type { Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { ok } from '../utils/response.js';
import { parsePagination, withPaginationMeta } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slug.js';
import type { AuthRequest } from '../middlewares/auth.js';

export async function listPosts(req: AuthRequest, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = (req.query.search as string) || '';
  const where: Prisma.BlogPostWhereInput = search
    ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    }
    : {};
  const [total, items] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ]);
  return ok(res, withPaginationMeta(items, total, page, limit));
}

export async function getPost(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) {
    const err: any = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  return ok(res, post);
}

export async function createPost(req: AuthRequest, res: Response) {
  const body = req.body as any;
  const slug = await uniqueSlug(body.title, 'blogPost');
  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug,
      content: body.content,
      coverImage: body.coverImage ?? null,
      status: body.status || 'DRAFT',
      authorId: req.user!.id,
    },
  });
  return ok(res, post, 'Post created');
}

export async function updatePost(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const body = req.body as any;
  delete body.slug;
  const post = await prisma.blogPost.update({ where: { id }, data: body });
  return ok(res, post, 'Post updated');
}

export async function deletePost(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.blogPost.delete({ where: { id } });
  return ok(res, { id }, 'Post deleted');
}
