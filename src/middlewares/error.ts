import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  if (err instanceof ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });

  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ error: 'InvalidJSON' });

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'NotFound' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'InvalidReference' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'AlreadyExists' });
  }

  return res.status(500).json({ error: 'InternalServerError' });
};
