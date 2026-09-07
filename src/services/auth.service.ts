import { prisma, isUniqueViolation } from '../configs/db';
import { hashPassword, verifyPassword } from '../utils/hash';
import { AppError } from '../utils/appError';

export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const registerUser = async (email: string, password: string) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new AppError(409, 'UserAlreadyExists');

  try {
    const { passwordHash: _, ...user } = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(password) },
    });
    return user;
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(409, 'UserAlreadyExists');
    throw error;
  }
};

export const authenticate = async (email: string, password: string) => {
  const invalidCredentials = new AppError(401, 'InvalidCredentials', 'Invalid email or password');

  const user = await findUserByEmail(email);
  if (!user) throw invalidCredentials;

  const isMatchingPassword = await verifyPassword(password, user.passwordHash);
  if (!isMatchingPassword) throw invalidCredentials;

  return user;
};
