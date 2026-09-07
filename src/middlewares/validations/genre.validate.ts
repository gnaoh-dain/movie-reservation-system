import z from 'zod';
import type { NoUndefined } from './index';

const genreParams = z.object({
  id: z.uuid({ message: 'Invalid genre ID' }),
});

const listGenresQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

const genreBody = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
});

type ListGenresQuery = NoUndefined<z.infer<typeof listGenresQuery>>;
type GenreParams = NoUndefined<z.infer<typeof genreParams>>;
type GenreBody = NoUndefined<z.infer<typeof genreBody>>;

export { genreParams, listGenresQuery, genreBody };
export type { ListGenresQuery, GenreParams, GenreBody };
