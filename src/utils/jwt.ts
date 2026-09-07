import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env';
import type { Role } from '../generated/prisma/enums';

const TOKEN_TTL = '7d';

export type TokenPayload = { userId: string; role: Role };
export type VerifiedToken = TokenPayload & { jti: string; exp: number };

function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL, jwtid: randomUUID() });
}

function verifyToken(token: string): VerifiedToken | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded === 'string') return null;

    const { userId, role, jti, exp } = decoded as Partial<VerifiedToken>;
    if (typeof userId !== 'string' || (role !== 'USER' && role !== 'ADMIN')) return null;
    if (typeof jti !== 'string' || typeof exp !== 'number') return null;

    return { userId, role, jti, exp };
  } catch {
    return null;
  }
}

export { signToken, verifyToken };
