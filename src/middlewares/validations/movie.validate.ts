import z from 'zod';
import type { NoUndefined } from './index';

const movieParams = z.object({
  id: z.uuid({ message: 'Invalid movie ID' }),
});

const listMoviesQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  genreId: z.uuid({ message: 'Invalid genre ID' }).optional(),
  search: z.string().trim().min(1).optional(),
});

const createMovieBody = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  description: z.string().trim().min(1, { message: 'Description is required' }),
  genreId: z.uuid({ message: 'Invalid genre ID' }),
});

const updateMovieBody = createMovieBody.partial();

type ListMoviesQuery = NoUndefined<z.infer<typeof listMoviesQuery>>;
type CreateMovieInput = NoUndefined<z.infer<typeof createMovieBody>>;
type UpdateMovieInput = NoUndefined<z.infer<typeof updateMovieBody>>;

export { movieParams, listMoviesQuery, createMovieBody, updateMovieBody };
export type { ListMoviesQuery, CreateMovieInput, UpdateMovieInput };
