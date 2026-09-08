import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';
import { isTokenRevoked } from '../utils/tokenBlacklist';
import { ACCESS_TOKEN_COOKIE } from '../configs/cookie';
import { AppError } from '../utils/appError';
import type { Role } from '../generated/prisma/enums';
import type { VerifiedToken } from '../utils/jwt';

export type AuthLocals = { user: VerifiedToken };

export const requireAuth: RequestHandler<any, any, any, any, AuthLocals> = async (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) throw new AppError(401, 'Unauthorized');

  const payload = verifyToken(token);
  if (!payload) throw new AppError(401, 'Unauthorized');

  if (await isTokenRevoked(payload.jti)) throw new AppError(401, 'Unauthorized');

  res.locals.user = payload;
  return next();
};

export const requireRole =
  (role: Role): RequestHandler<any, any, any, any, AuthLocals> =>
  (_req, res, next) => {
    if (res.locals.user?.role !== role) throw new AppError(403, 'Forbidden');

    return next();
  };
