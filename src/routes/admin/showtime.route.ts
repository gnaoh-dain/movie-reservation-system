import { Router } from 'express';
import { validate } from '../../middlewares/validations';
import {
  showtimeParams,
  createShowtimeBody,
  updateShowtimeBody,
} from '../../middlewares/validations/showtime.validate';
import { createShowtime, updateShowtime, deleteShowtime } from '../../services/showtime.service';

const router = Router();

router.post('/', validate({ body: createShowtimeBody }), async (req, res) => {
  const { movieId, theaterId, startsAt, price } = req.body;

  const data = await createShowtime({ movieId, theaterId, startsAt, price });
  return res.status(201).json({ message: 'Showtime created successfully', data });
});

router.put('/:id', validate({ params: showtimeParams, body: updateShowtimeBody }), async (req, res) => {
  const { id } = req.params;
  const { movieId, theaterId, startsAt, price } = req.body;

  const data = await updateShowtime(id, { movieId, theaterId, startsAt, price });
  return res.status(200).json({ message: 'Showtime updated successfully', data });
});

router.delete('/:id', validate({ params: showtimeParams }), async (req, res) => {
  const { id } = req.params;

  const data = await deleteShowtime(id);
  return res.status(200).json({ message: 'Showtime deleted successfully', data });
});

export default router;
