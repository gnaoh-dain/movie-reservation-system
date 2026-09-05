import { prisma } from '../configs/db';
import { hashPassword } from '../utils/hash';

export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const createUser = async (email: string, password: string) => {
  const { passwordHash: _, ...user } = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });
  return user;
};
