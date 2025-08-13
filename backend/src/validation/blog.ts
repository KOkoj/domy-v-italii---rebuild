import { z } from 'zod';
import { BlogStatus } from '@prisma/client';

export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().url().optional().nullable(),
  status: z.nativeEnum(BlogStatus).optional().default('DRAFT')
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const listBlogPostsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z.nativeEnum(BlogStatus).optional(),
  search: z.string().optional()
});

export type CreateBlogPostDto = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostDto = z.infer<typeof updateBlogPostSchema>;
export type ListBlogPostsQuery = z.infer<typeof listBlogPostsSchema>;
