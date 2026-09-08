import z from 'zod';
import { NoUndefined } from '.';

const reservationBody = z.object({
  showtimeId: z.uuid({ message: 'Invalid showtime ID' }),
  seatIds: z
    .array(z.uuid({ message: 'Invalid seat ID' }))
    .min(1, { message: 'At least one seat must be selected' })
    .refine((ids) => new Set(ids).size === ids.length, { message: 'Duplicate seat IDs' }),
});

export type ReservationBody = NoUndefined<z.infer<typeof reservationBody>>;

export { reservationBody };
