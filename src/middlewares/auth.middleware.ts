import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import type { Role } from '../generated/prisma/enums';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // verifyToken đã nuốt mọi lỗi và trả null, nên chỉ cần kiểm tra null
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  req.user = payload;
  next();
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
