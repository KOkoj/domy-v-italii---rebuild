import { Router } from 'express';
import { login, me, refresh, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { loginSchema, refreshSchema } from '../validation/auth.js';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and obtain tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Logged in
 */
export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/refresh', validateBody(refreshSchema), refresh);
authRouter.get('/me', authenticate, me);
authRouter.post('/logout', authenticate, logout);
