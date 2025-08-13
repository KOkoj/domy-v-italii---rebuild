import type { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { comparePassword } from '../utils/password.js';
import { ok } from '../utils/response.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import type { AuthRequest } from '../middlewares/auth.js';

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });

  const { password: _pw, ...safeUser } = user;
  return ok(res, { user: safeUser, token, refreshToken });
}

export async function me(req: AuthRequest, res: Response) {
  const id = req.user!.id;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const { password: _pw, ...safeUser } = user;
  return ok(res, safeUser);
}

export async function refresh(req: AuthRequest, res: Response) {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    const err: any = new Error('Refresh token required');
    err.status = 400;
    throw err;
  }
  const payload = verifyRefreshToken(refreshToken);
  const token = signAccessToken({ id: payload.id });
  return ok(res, { token });
}

export async function logout(_req: AuthRequest, res: Response) {
  return ok(res, { success: true }, 'Logged out');
}
