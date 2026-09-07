import { redis } from '../configs/redis';
import type { VerifiedToken } from './jwt';

const key = (jti: string) => `token:blacklist:${jti}`;

export const revokeToken = async ({ jti, exp }: VerifiedToken) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl <= 0) return;

  await redis.set(key(jti), '1', { EX: ttl });
};

export const isTokenRevoked = async (jti: string) => (await redis.exists(key(jti))) === 1;
