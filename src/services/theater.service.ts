import { prisma, isUniqueViolation } from '../configs/db';
import { Prisma } from '../generated/prisma/client';
import { AppError } from '../utils/appError';
import type { LayoutBody, ListTheatersParams } from '../middlewares/validations/theater.validate';

export const listTheaters = async ({ name, page, limit, orderBy }: ListTheatersParams) => {
  const where = name ? { name: { contains: name, mode: Prisma.QueryMode.insensitive } } : {};

  const [items, total] = await Promise.all([
    prisma.theater.findMany({ where, orderBy: { name: orderBy }, skip: (page - 1) * limit, take: limit }),
    prisma.theater.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findTheaterById = (id: string) => prisma.theater.findUnique({ where: { id } });

export const getTheaterById = async (id: string) => {
  const theater = await findTheaterById(id);
  if (!theater) throw new AppError(404, 'TheaterNotFound');

  return theater;
};

export const createTheater = async (name: string) => {
  const existing = await prisma.theater.findUnique({ where: { name } });
  if (existing) throw new AppError(409, 'TheaterAlreadyExists');

  try {
    return await prisma.theater.create({ data: { name } });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(409, 'TheaterAlreadyExists');
    throw error;
  }
};

export const replaceLayout = async (theaterId: string, rows: LayoutBody['rows']) => {
  await getTheaterById(theaterId);

  const seats = rows.flatMap(({ name, seatCount, defaultType, overrides }) =>
    Array.from({ length: seatCount }, (_, i) => {
      const number = i + 1;
      const override = overrides.find((o) => number >= o.from && number <= o.to);

      return { theaterId, row: name, number, type: override?.type ?? defaultType };
    }),
  );

  return prisma.$transaction(async (tx) => {
    await tx.seat.deleteMany({ where: { theaterId } });
    await tx.seat.createMany({ data: seats });

    return tx.seat.findMany({ where: { theaterId }, orderBy: [{ row: 'asc' }, { number: 'asc' }] });
  });
};
