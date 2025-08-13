import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createPost, deletePost, getPost, listPosts, updatePost } from '../controllers/blog.controller.js';

export const blogRouter = Router();

blogRouter.get('/', listPosts);
blogRouter.get('/:id', getPost);

blogRouter.use(authenticate);
blogRouter.post('/', createPost);
blogRouter.put('/:id', updatePost);
blogRouter.delete('/:id', deletePost);
