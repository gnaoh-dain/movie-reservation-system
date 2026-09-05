import fs from 'node:fs/promises';
import multer from 'multer';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(err);

  // request lỗi thì file multer đã ghi ra đĩa là rác, xoá đi
  const uploaded = req.file ? [req.file] : Object.values(req.files ?? {}).flat();
  for (const file of uploaded) fs.unlink(file.path).catch(() => {});

  if (err instanceof multer.MulterError) return res.status(400).json({ error: 'UploadError', message: err.message });
  if (err instanceof ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });

  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ error: 'InvalidJSON' });

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'NotFound' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'InvalidReference' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'AlreadyExists' });
  }

  return res.status(500).json({ error: 'InternalServerError' });
};
