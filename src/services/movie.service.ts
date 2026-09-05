import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../configs/db';
import { uploadDir } from '../configs/upload';
import type { ListMoviesQuery, CreateMovieInput, UpdateMovieInput } from '../middlewares/validations/movie.validate';

const include = { genre: true } as const;
const alive = { deletedAt: null };

type CreateMovieData = CreateMovieInput & { posterImageId: string | null };

export const listMovies = async ({ page, limit, genreId, search }: ListMoviesQuery) => {
  const where = {
    ...alive,
    ...(genreId ? { genreId } : {}),
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.movie.findMany({ where, include, orderBy: { id: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.movie.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const getMovieById = (id: string) => prisma.movie.findFirst({ where: { id, ...alive }, include });

export const createMovie = (data: CreateMovieData) => prisma.movie.create({ data, include });

export const updateMovie = async (id: string, data: UpdateMovieInput, posterImageId?: string) => {
  const current = await prisma.movie.findFirst({ where: { id, ...alive }, select: { posterImageId: true } });
  if (!current) return null;

  const movie = await prisma.movie.update({
    where: { id },
    data: posterImageId ? { ...data, posterImageId } : data,
    include,
  });

  if (posterImageId && current.posterImageId) {
    await unlink(path.join(uploadDir, current.posterImageId)).catch(() => {});
  }

  return movie;
};

export const deleteMovie = async (id: string) => {
  const { count } = await prisma.movie.updateMany({ where: { id, ...alive }, data: { deletedAt: new Date() } });
  if (count === 0) return null;

  return prisma.movie.findUniqueOrThrow({ where: { id }, include });
};
