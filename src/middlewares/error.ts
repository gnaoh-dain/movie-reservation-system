import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  if (err instanceof ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });

  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ error: 'InvalidJSON' });

  return res.status(500).json({ error: 'InternalServerError' });
};
