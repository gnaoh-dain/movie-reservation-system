import { prisma, isUniqueViolation } from '../configs/db';
import { AppError } from '../utils/appError';
import { getShowtimeById } from './showtime.service';
import type { ReservationBody } from '../middlewares/validations/reservation.validate';

const include = {
  showtime: {
    include: {
      movie: { select: { id: true, title: true } },
      theater: { select: { id: true, name: true } },
    },
  },
  seats: { select: { seat: { select: { id: true, row: true, number: true, type: true } } } },
} as const;

export const createReservation = async (userId: string, { showtimeId, seatIds }: ReservationBody) => {
  const showtime = await getShowtimeById(showtimeId);
  if (showtime.startsAt <= new Date()) throw new AppError(409, 'ShowtimeStarted');

  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds }, theaterId: showtime.theaterId },
    select: { id: true },
  });
  if (seats.length !== seatIds.length) {
    throw new AppError(400, 'InvalidSeats', 'Some seats do not exist in this showtime’s theater');
  }

  try {
    const reservation = await prisma.reservation.create({
      data: { userId, showtimeId, seats: { create: seatIds.map((seatId) => ({ showtimeId, seatId })) } },
      include,
    });

    return { ...reservation, seats: reservation.seats.map(({ seat }) => seat) };
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(409, 'SeatsAlreadyReserved');
    throw error;
  }
};
