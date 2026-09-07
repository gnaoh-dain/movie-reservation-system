import { prisma } from '../configs/db';
import type { ListGenresQuery } from '../middlewares/validations/genre.validate';

const alive = { deletedAt: null };

export const listGenres = async ({ page, limit, orderBy }: ListGenresQuery) => {
  const [items, total] = await Promise.all([
    prisma.genre.findMany({ where: alive, orderBy: { name: orderBy }, skip: (page - 1) * limit, take: limit }),
    prisma.genre.count({ where: alive }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const getGenreById = (id: string) => prisma.genre.findFirst({ where: { id, ...alive } });

export const createGenre = async (name: string) => {
  const existing = await prisma.genre.findUnique({ where: { name } });
  if (!existing) return prisma.genre.create({ data: { name } });
  if (!existing.deletedAt) return null;

  return prisma.genre.update({ where: { name }, data: { deletedAt: null } });
};

export const updateGenre = async (id: string, name: string) => {
  const { count } = await prisma.genre.updateMany({ where: { id, ...alive }, data: { name } });
  if (count === 0) return null;

  return prisma.genre.findUniqueOrThrow({ where: { id } });
};

export const deleteGenre = async (id: string) => {
  const { count } = await prisma.genre.updateMany({ where: { id, ...alive }, data: { deletedAt: new Date() } });
  if (count === 0) return null;

  return prisma.genre.findUniqueOrThrow({ where: { id } });
};
