import z from 'zod';

const movieParams = z.object({
  id: z.uuid({ message: 'Invalid movie ID' }),
});

const listMoviesQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  genreId: z.uuid({ message: 'Invalid genre ID' }).optional(),
  search: z.string().trim().min(1).optional(),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

type ListMoviesParams = {
  page: number;
  limit: number;
  genreId: string | undefined;
  search: string | undefined;
  orderBy: 'asc' | 'desc';
};

const createMovieBody = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  description: z.string().trim().min(1, { message: 'Description is required' }),
  genreId: z.uuid({ message: 'Invalid genre ID' }),
});

const updateMovieBody = createMovieBody.partial();

type CreateMovieParams = {
  title: string;
  description: string;
  genreId: string;
  posterImageId: string | undefined;
};

type UpdateMovieParams = {
  title: string | undefined;
  description: string | undefined;
  genreId: string | undefined;
};

export { movieParams, listMoviesQuery, createMovieBody, updateMovieBody };
export type { ListMoviesParams, CreateMovieParams, UpdateMovieParams };
