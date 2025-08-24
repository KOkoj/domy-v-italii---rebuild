import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validateBody } from '../middlewares/validate.js';
import { createBlogPostSchema } from '../validation/blog.js';
import { createPost, deletePost, getPost, listPosts, updatePost } from '../controllers/blog.controller.js';

export const blogRouter = Router();

blogRouter.get('/', listPosts);
blogRouter.get('/:id', getPost);

blogRouter.use(authenticate);
blogRouter.post('/', authorize('ADMIN', 'MANAGER'), validateBody(createBlogPostSchema), createPost);
blogRouter.put('/:id', updatePost);
blogRouter.delete('/:id', deletePost);
