import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma/enums';
import { validate } from '../middlewares/validations';
import {
  showtimeParams,
  listShowtimesQuery,
  createShowtimeBody,
  updateShowtimeBody,
} from '../middlewares/validations/showtime.validate';
import {
  listShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} from '../services/showtime.service';

const router = Router();

router.get('/', validate({ query: listShowtimesQuery }), async (req, res) => {
  const { page, limit, movieId, theaterId, from, to, orderBy } = req.query;

  const data = await listShowtimes({ page, limit, movieId, theaterId, from, to, orderBy });
  return res.status(200).json({ message: 'Showtimes fetched successfully', data });
});

router.get('/:id', validate({ params: showtimeParams }), async (req, res) => {
  const { id } = req.params;

  const data = await getShowtimeById(id);
  return res.status(200).json({ message: 'Showtime fetched successfully', data });
});

router.post('/', requireAuth, requireRole(Role.ADMIN), validate({ body: createShowtimeBody }), async (req, res) => {
  const { movieId, theaterId, startsAt, price } = req.body;

  const data = await createShowtime({ movieId, theaterId, startsAt, price });
  return res.status(201).json({ message: 'Showtime created successfully', data });
});

router.put(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  validate({ params: showtimeParams, body: updateShowtimeBody }),
  async (req, res) => {
    const { id } = req.params;
    const { movieId, theaterId, startsAt, price } = req.body;

    const data = await updateShowtime(id, { movieId, theaterId, startsAt, price });
    return res.status(200).json({ message: 'Showtime updated successfully', data });
  },
);

router.delete('/:id', requireAuth, requireRole(Role.ADMIN), validate({ params: showtimeParams }), async (req, res) => {
  const { id } = req.params;

  const data = await deleteShowtime(id);
  return res.status(200).json({ message: 'Showtime deleted successfully', data });
});

export default router;
