import { Router } from 'express';
import { registerUser, authenticate } from '../services/auth.service';
import { signToken, verifyToken } from '../utils/jwt';
import { revokeToken } from '../utils/tokenBlacklist';
import { ACCESS_TOKEN_COOKIE, accessTokenMaxAge, cookieOptions } from '../configs/cookie';
import { validate } from '../middlewares/validations';
import { rateLimit } from '../middlewares/rateLimit';
import { loginBody, registerBody } from '../middlewares/validations/auth.validate';

const router = Router();

const loginRateLimit = rateLimit({ keyPrefix: 'login', limit: 5, windowSeconds: 15 * 60 });

router.post('/register', validate({ body: registerBody }), async (req, res) => {
  const { email, password } = req.body;

  const data = await registerUser(email, password);
  return res.status(201).json({ message: 'User registered successfully', data });
});

router.post('/login', loginRateLimit, validate({ body: loginBody }), async (req, res) => {
  const { email, password } = req.body;

  const user = await authenticate(email, password);

  const accessToken = signToken({ userId: user.id, role: user.role });
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...cookieOptions, maxAge: accessTokenMaxAge });

  return res.status(200).json({ message: 'Login successful', data: null });
});

router.post('/logout', async (req, res) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  const payload = token ? verifyToken(token) : null;
  if (payload) await revokeToken(payload);

  res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
  return res.status(200).json({ message: 'Logout successful', data: null });
});

export default router;
