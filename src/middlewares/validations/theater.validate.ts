import z from 'zod';
import { SEAT_TYPE } from '../../generated/prisma/enums';
import type { NoUndefined } from './index';

const theaterParams = z.object({
  theaterId: z.uuid({ message: 'Invalid theater ID' }),
});

const theaterBody = z.object({
  name: z.string().trim().min(1, { message: 'Theater name is required' }),
});

const listTheatersQuery = z.object({
  name: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  orderBy: z.enum(['asc', 'desc']).default('asc'),
});

const seatType = z.enum(SEAT_TYPE, { message: `Type must be one of: ${Object.values(SEAT_TYPE).join(', ')}` });

const override = z
  .object({
    from: z.coerce.number().int().positive(),
    to: z.coerce.number().int().positive(),
    type: seatType,
  })
  .refine(({ from, to }) => from <= to, { message: 'from must be <= to', path: ['to'] });

const layoutBody = z.object({
  rows: z
    .array(
      z
        .object({
          name: z.string().trim().min(1, { message: 'Row name is required' }).toUpperCase(),
          seatCount: z.coerce.number().int().positive().max(100),
          defaultType: seatType.default(SEAT_TYPE.REGULAR),
          overrides: z.array(override).default([]),
        })
        .superRefine(checkOverrides),
    )
    .min(1, { message: 'At least one row is required' })
    .superRefine(noDuplicateRows),
});

type Row = { seatCount: number; overrides: { from: number; to: number }[] };

function checkOverrides({ seatCount, overrides }: Row, ctx: z.RefinementCtx) {
  const order = overrides.map((_, i) => i).sort((a, b) => overrides[a]!.from - overrides[b]!.from);
  order.forEach((i, rank) => {
    const cur = overrides[i]!;
    const prev = rank > 0 ? overrides[order[rank - 1]!]! : null;
    if (cur.to > seatCount) {
      ctx.addIssue({
        code: 'custom',
        message: `Override exceeds seatCount ${seatCount}`,
        path: ['overrides', i, 'to'],
      });
    }
    if (prev && cur.from <= prev.to) {
      ctx.addIssue({ code: 'custom', message: 'Overrides must not overlap', path: ['overrides', i, 'from'] });
    }
  });
}

function noDuplicateRows(rows: { name: string }[], ctx: z.RefinementCtx) {
  const seen = new Set<string>();
  rows.forEach(({ name }, i) => {
    if (seen.has(name)) ctx.addIssue({ code: 'custom', message: `Duplicate row "${name}"`, path: [i, 'name'] });
    seen.add(name);
  });
}

type ListTheatersParams = {
  name: string | undefined;
  page: number;
  limit: number;
  orderBy: 'asc' | 'desc';
};

type LayoutBody = NoUndefined<z.infer<typeof layoutBody>>;

export { theaterParams, theaterBody, layoutBody, listTheatersQuery };
export type { LayoutBody, ListTheatersParams };
