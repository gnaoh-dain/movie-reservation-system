import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import type { Role } from '../generated/prisma/enums';

export function requireAuth(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  req.user = payload;
  next();
}

export function requireRole(role: Role) {
  return (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
