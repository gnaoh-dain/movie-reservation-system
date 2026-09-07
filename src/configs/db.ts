import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { env } from './env';
import { imageUrl } from './upload';

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl }),
}).$extends({
  result: {
    movie: {
      posterUrl: {
        needs: { posterImageId: true },
        compute: (movie) => (movie.posterImageId ? imageUrl(movie.posterImageId) : null),
      },
    },
  },
});

export const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
