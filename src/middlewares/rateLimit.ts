import type { Request, Response, NextFunction } from 'express';
import { redis } from '../configs/redis';
import { AppError } from '../utils/appError';

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
};

export const rateLimit =
  ({ keyPrefix, limit, windowSeconds }: RateLimitOptions) =>
  async (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    const key = `ratelimit:${keyPrefix}:${req.ip}`;

    const hits = await redis.incr(key);
    if (hits === 1) await redis.expire(key, windowSeconds);

    if (hits > limit) {
      res.setHeader('Retry-After', String(await redis.ttl(key)));
      throw new AppError(429, 'TooManyRequests');
    }

    return next();
  };
