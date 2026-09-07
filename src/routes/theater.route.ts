import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma/enums';
import { validate } from '../middlewares/validations';
import {
  theaterParams,
  listTheatersQuery,
  theaterBody,
  layoutBody,
} from '../middlewares/validations/theater.validate';
import { listTheaters, getTheaterById, createTheater, replaceLayout } from '../services/theater.service';

const router = Router();

router.get('/', validate({ query: listTheatersQuery }), async (req, res) => {
  const { name, page, limit, orderBy } = req.query;

  const data = await listTheaters({ name, page, limit, orderBy });
  return res.status(200).json({ message: 'Theaters fetched successfully', data });
});

router.get('/:theaterId', validate({ params: theaterParams }), async (req, res) => {
  const { theaterId } = req.params;

  const data = await getTheaterById(theaterId);
  return res.status(200).json({ message: 'Theater fetched successfully', data });
});

router.post('/', requireAuth, requireRole(Role.ADMIN), validate({ body: theaterBody }), async (req, res) => {
  const { name } = req.body;

  const data = await createTheater(name);
  return res.status(201).json({ message: 'Theater created successfully', data });
});

router.post(
  '/:theaterId/layout',
  requireAuth,
  requireRole(Role.ADMIN),
  validate({ params: theaterParams, body: layoutBody }),
  async (req, res) => {
    const { theaterId } = req.params;
    const { rows } = req.body;

    const data = await replaceLayout(theaterId, rows);
    return res.status(201).json({ message: 'Layout saved successfully', data });
  },
);

export default router;
