import { prisma, isUniqueViolation } from '../configs/db';
import { AppError } from '../utils/appError';
import type { ListGenresParams } from '../middlewares/validations/genre.validate';

const alive = { deletedAt: null };

export const listGenres = async ({ page, limit, orderBy }: ListGenresParams) => {
  const [items, total] = await Promise.all([
    prisma.genre.findMany({ where: alive, orderBy: { name: orderBy }, skip: (page - 1) * limit, take: limit }),
    prisma.genre.count({ where: alive }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findGenreById = (id: string) => prisma.genre.findFirst({ where: { id, ...alive } });

export const getGenreById = async (id: string) => {
  const genre = await findGenreById(id);
  if (!genre) throw new AppError(404, 'GenreNotFound');

  return genre;
};

const countMoviesByGenre = (genreId: string) => prisma.movie.count({ where: { genreId, ...alive } });

export const createGenre = async (name: string) => {
  const existing = await prisma.genre.findUnique({ where: { name } });
  if (existing) {
    if (!existing.deletedAt) throw new AppError(409, 'GenreAlreadyExists');

    return prisma.genre.update({ where: { name }, data: { deletedAt: null } });
  }

  try {
    return await prisma.genre.create({ data: { name } });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(409, 'GenreAlreadyExists');
    throw error;
  }
};

export const updateGenre = async (id: string, name: string) => {
  await getGenreById(id);

  try {
    return await prisma.genre.update({ where: { id }, data: { name } });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(409, 'GenreAlreadyExists');
    throw error;
  }
};

export const deleteGenre = async (id: string) => {
  await getGenreById(id);

  const movieCount = await countMoviesByGenre(id);
  if (movieCount > 0) {
    throw new AppError(409, 'GenreInUse', `${movieCount} movie(s) still use this genre`);
  }

  return prisma.genre.update({ where: { id }, data: { deletedAt: new Date() } });
};
