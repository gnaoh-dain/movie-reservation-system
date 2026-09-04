import jwt from 'jsonwebtoken';
import { env } from '../configs/env';
import type { Role } from '../generated/prisma/enums';

const TOKEN_TTL = '7d';

export type TokenPayload = { userId: string; role: Role };

function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded === 'string') return null;
    const { userId, role } = decoded as Partial<TokenPayload>;
    return typeof userId === 'string' && (role === 'USER' || role === 'ADMIN') ? { userId, role } : null;
  } catch {
    return null;
  }
}

export { signToken, verifyToken };
