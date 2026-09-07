import type { CookieOptions } from 'express';
import { env } from './env';

export const ACCESS_TOKEN_COOKIE = 'accessToken';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
};

export const accessTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
