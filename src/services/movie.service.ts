import { prisma } from '../configs/db';
import type { ListMoviesQuery, CreateMovieInput, UpdateMovieInput } from '../middlewares/validations/movie.validate';

const include = { genre: true } as const;

type CreateMovieData = CreateMovieInput & { posterUrl: string | null };

export const listMovies = async ({ page, limit, genreId, search }: ListMoviesQuery) => {
  const where = {
    ...(genreId ? { genreId } : {}),
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.movie.findMany({ where, include, orderBy: { id: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.movie.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const getMovieById = (id: string) => prisma.movie.findUnique({ where: { id }, include });

export const createMovie = (data: CreateMovieData) => prisma.movie.create({ data, include });

export const updateMovie = (id: string, data: UpdateMovieInput) =>
  prisma.movie.update({ where: { id }, data, include });

export const deleteMovie = (id: string) => prisma.movie.delete({ where: { id }, include });
