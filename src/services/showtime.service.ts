import { prisma } from '../configs/db';
import { AppError } from '../utils/appError';
import { findMovieById } from './movie.service';
import { findTheaterById } from './theater.service';
import type {
  CreateShowtimeInput,
  ListShowtimesParams,
  UpdateShowtimeParams,
} from '../middlewares/validations/showtime.validate';

const include = {
  movie: { select: { id: true, title: true } },
  theater: { select: { id: true, name: true } },
} as const;

export const listShowtimes = async ({ page, limit, movieId, theaterId, from, to, orderBy }: ListShowtimesParams) => {
  const where = {
    ...(movieId ? { movieId } : {}),
    ...(theaterId ? { theaterId } : {}),
    ...(from || to ? { startsAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.showtime.findMany({ where, include, orderBy: { startsAt: orderBy }, skip: (page - 1) * limit, take: limit }),
    prisma.showtime.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findShowtimeById = (id: string) => prisma.showtime.findUnique({ where: { id }, include });

export const getShowtimeById = async (id: string) => {
  const showtime = await findShowtimeById(id);
  if (!showtime) throw new AppError(404, 'ShowtimeNotFound');

  return showtime;
};

export const getSeatsByShowtimeId = async (showtimeId: string) => {
  const showtime = await findShowtimeById(showtimeId);
  if (!showtime) throw new AppError(404, 'ShowtimeNotFound');

  const [seats, taken] = await Promise.all([
    prisma.seat.findMany({
      where: { theaterId: showtime.theaterId },
      select: { id: true, row: true, number: true, type: true },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    }),
    prisma.reservationSeat.findMany({ where: { showtimeId }, select: { seatId: true } }),
  ]);

  const reserved = new Set(taken.map(({ seatId }) => seatId));

  return {
    theater: showtime.theater,
    movie: showtime.movie,
    showtime: showtime.startsAt,
    seats: seats.map((seat) => ({ ...seat, reserved: reserved.has(seat.id) })),
  };
};

const countReservations = (showtimeId: string) => prisma.reservation.count({ where: { showtimeId } });

const assertMovieAndTheaterExist = async (movieId: string, theaterId: string) => {
  const [movie, theater] = await Promise.all([findMovieById(movieId), findTheaterById(theaterId)]);

  if (!movie) throw new AppError(400, 'MovieNotFound');
  if (!theater) throw new AppError(400, 'TheaterNotFound');
};

const assertNoConflict = async (theaterId: string, startsAt: Date, excludeId?: string) => {
  const conflict = await prisma.showtime.findFirst({
    where: { theaterId, startsAt, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (conflict) throw new AppError(409, 'ShowtimeConflict');
};

export const createShowtime = async ({ movieId, theaterId, startsAt, price }: CreateShowtimeInput) => {
  await assertMovieAndTheaterExist(movieId, theaterId);
  await assertNoConflict(theaterId, startsAt);

  return prisma.showtime.create({ data: { movieId, theaterId, startsAt, price }, include });
};

export const updateShowtime = async (id: string, { movieId, theaterId, startsAt, price }: UpdateShowtimeParams) => {
  if (!movieId && !theaterId && !startsAt && price === undefined) {
    throw new AppError(400, 'EmptyUpdate', 'At least one field is required');
  }

  const current = await getShowtimeById(id);

  await assertMovieAndTheaterExist(movieId ?? current.movieId, theaterId ?? current.theaterId);
  await assertNoConflict(theaterId ?? current.theaterId, startsAt ?? current.startsAt, id);

  const data = {
    ...(movieId ? { movieId } : {}),
    ...(theaterId ? { theaterId } : {}),
    ...(startsAt ? { startsAt } : {}),
    ...(price !== undefined ? { price } : {}),
  };

  return prisma.showtime.update({ where: { id }, data, include });
};

export const deleteShowtime = async (id: string) => {
  const showtime = await getShowtimeById(id);

  const reservationCount = await countReservations(id);
  if (reservationCount > 0) {
    throw new AppError(409, 'ShowtimeHasReservations', `${reservationCount} reservation(s) already booked`);
  }

  await prisma.showtime.delete({ where: { id } });
  return showtime;
};
