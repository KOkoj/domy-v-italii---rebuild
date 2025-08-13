import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../env.js';

export type JwtPayload = { id: string };

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET as unknown as jwt.Secret, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  });

export const signRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.REFRESH_TOKEN_SECRET as unknown as jwt.Secret, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtPayload;
