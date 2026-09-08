import { Router } from 'express';
import { validate } from '../middlewares/validations';
import { showtimeParams, listShowtimesQuery } from '../middlewares/validations/showtime.validate';
import { listShowtimes, getShowtimeById, getSeatsByShowtimeId } from '../services/showtime.service';

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

router.get('/:id/seats', validate({ params: showtimeParams }), async (req, res) => {
  const { id } = req.params;
  const data = await getSeatsByShowtimeId(id);
  return res.status(200).json({ message: 'Seats fetched successfully', data });
});

export default router;
