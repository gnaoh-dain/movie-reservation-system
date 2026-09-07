import z from 'zod';
import type { NoUndefined } from './index';

const showtimeParams = z.object({
  id: z.uuid({ message: 'Invalid showtime ID' }),
});

const listShowtimesQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  movieId: z.uuid({ message: 'Invalid movie ID' }).optional(),
  theaterId: z.uuid({ message: 'Invalid theater ID' }).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  orderBy: z.enum(['asc', 'desc']).default('asc'),
});

const createShowtimeBody = z.object({
  movieId: z.uuid({ message: 'Invalid movie ID' }),
  theaterId: z.uuid({ message: 'Invalid theater ID' }),
  startsAt: z.coerce.date({ message: 'Invalid start time' }),
  price: z.coerce.number().positive({ message: 'Price must be greater than 0' }),
});

const updateShowtimeBody = createShowtimeBody.partial();

type ListShowtimesParams = {
  page: number;
  limit: number;
  movieId: string | undefined;
  theaterId: string | undefined;
  from: Date | undefined;
  to: Date | undefined;
  orderBy: 'asc' | 'desc';
};

type UpdateShowtimeParams = {
  movieId: string | undefined;
  theaterId: string | undefined;
  startsAt: Date | undefined;
  price: number | undefined;
};

type CreateShowtimeInput = NoUndefined<z.infer<typeof createShowtimeBody>>;

export { showtimeParams, listShowtimesQuery, createShowtimeBody, updateShowtimeBody };
export type { ListShowtimesParams, CreateShowtimeInput, UpdateShowtimeParams };
