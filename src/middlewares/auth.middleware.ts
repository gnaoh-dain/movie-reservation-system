import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { isTokenRevoked } from '../utils/tokenBlacklist';
import { ACCESS_TOKEN_COOKIE } from '../configs/cookie';
import { AppError } from '../utils/appError';
import type { Role } from '../generated/prisma/enums';

export async function requireAuth(req: Request<any, any, any, any>, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) throw new AppError(401, 'Unauthorized');

  const payload = verifyToken(token);
  if (!payload) throw new AppError(401, 'Unauthorized');

  if (await isTokenRevoked(payload.jti)) throw new AppError(401, 'Unauthorized');

  req.user = payload;
  return next();
}

export function requireRole(role: Role) {
  return (req: Request<any, any, any, any>, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole !== role) throw new AppError(403, 'Forbidden');

    return next();
  };
}
