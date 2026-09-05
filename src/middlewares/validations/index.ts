import z from 'zod';
import type { Request, RequestHandler } from 'express';

type Schemas = {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
};

export type NoUndefined<T> = { [K in keyof T]: Exclude<T[K], undefined> };
type Infer<T, Fallback> = T extends z.ZodType ? NoUndefined<z.infer<T>> : Fallback;

export const validate =
  <S extends Schemas>(
    schema: S,
  ): RequestHandler<
    Infer<S['params'], Request['params']>,
    any,
    Infer<S['body'], any>,
    Infer<S['query'], Request['query']>
  > =>
  (req, res, next) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body) as any;
      if (schema.query) Object.defineProperty(req, 'query', { value: schema.query.parse(req.query), writable: true });
      if (schema.params) req.params = schema.params.parse(req.params) as any;
      next();
    } catch (error) {
      return next(error);
    }
  };
