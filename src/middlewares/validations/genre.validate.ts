import z from 'zod';

const genreParams = z.object({
  id: z.uuid({ message: 'Invalid genre ID' }),
});

const listGenresQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

type ListGenresParams = {
  page: number;
  limit: number;
  orderBy: 'asc' | 'desc';
};

const genreBody = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
});

export { genreParams, listGenresQuery, genreBody };
export type { ListGenresParams };
