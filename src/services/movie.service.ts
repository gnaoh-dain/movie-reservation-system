import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../configs/db';
import { uploadDir } from '../configs/upload';
import { AppError } from '../utils/appError';
import { findGenreById } from './genre.service';
import type { ListMoviesParams, CreateMovieParams, UpdateMovieParams } from '../middlewares/validations/movie.validate';

const include = { genre: true } as const;
const alive = { deletedAt: null };

export const listMovies = async ({ page, limit, genreId, search, orderBy }: ListMoviesParams) => {
  const where = {
    ...alive,
    ...(genreId ? { genreId } : {}),
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.movie.findMany({ where, include, orderBy: { id: orderBy }, skip: (page - 1) * limit, take: limit }),
    prisma.movie.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findMovieById = (id: string) => prisma.movie.findFirst({ where: { id, ...alive }, include });

export const getMovieById = async (id: string) => {
  const movie = await findMovieById(id);
  if (!movie) throw new AppError(404, 'MovieNotFound');

  return movie;
};

const assertGenreExists = async (genreId: string) => {
  const genre = await findGenreById(genreId);
  if (!genre) throw new AppError(400, 'GenreNotFound');
};

export const createMovie = async ({ title, description, genreId, posterImageId }: CreateMovieParams) => {
  if (!posterImageId) throw new AppError(400, 'PosterRequired', 'Poster image is required');

  await assertGenreExists(genreId);

  return prisma.movie.create({ data: { title, description, genreId, posterImageId }, include });
};

export const updateMovie = async (
  id: string,
  { title, description, genreId }: UpdateMovieParams,
  posterImageId?: string,
) => {
  if (!title && !description && !genreId && !posterImageId) {
    throw new AppError(400, 'EmptyUpdate', 'At least one field or a poster is required');
  }

  const current = await prisma.movie.findFirst({ where: { id, ...alive }, select: { posterImageId: true } });
  if (!current) throw new AppError(404, 'MovieNotFound');

  if (genreId) await assertGenreExists(genreId);

  const data = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(genreId ? { genreId } : {}),
    ...(posterImageId ? { posterImageId } : {}),
  };

  const movie = await prisma.movie.update({ where: { id }, data, include });

  if (posterImageId && current.posterImageId) {
    await unlink(path.join(uploadDir, current.posterImageId)).catch(() => {});
  }

  return movie;
};

export const deleteMovie = async (id: string) => {
  await getMovieById(id);

  return prisma.movie.update({ where: { id }, data: { deletedAt: new Date() }, include });
};
