import { Router } from 'express';
import { verifyPassword } from '../utils/hash';
import { findUserByEmail, createUser } from '../services/auth.service';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const data = await createUser(email, password);

    return res.status(201).json({ message: 'User registered successfully', data });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatchingPassword = await verifyPassword(password, user?.passwordHash);
    if (!isMatchingPassword) return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken = signToken({ userId: user.id, role: user.role });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ message: 'Login successful', data: null });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return res.status(200).json({ message: 'Logout successful', data: null });
});

export default router;
