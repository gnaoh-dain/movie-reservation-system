import { Router } from 'express';
import { validate } from '../middlewares/validations';
import { theaterParams, listTheatersQuery } from '../middlewares/validations/theater.validate';
import { listTheaters, getTheaterById } from '../services/theater.service';

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

export default router;
