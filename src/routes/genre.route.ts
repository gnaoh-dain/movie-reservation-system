import { Router } from 'express';
import { validate } from '../middlewares/validations';
import { genreParams, listGenresQuery } from '../middlewares/validations/genre.validate';
import { listGenres, getGenreById } from '../services/genre.service';

const router = Router();

router.get('/', validate({ query: listGenresQuery }), async (req, res) => {
  const { page, limit, orderBy } = req.query;

  const data = await listGenres({ page, limit, orderBy });
  return res.status(200).json({ message: 'Genres fetched successfully', data });
});

router.get('/:id', validate({ params: genreParams }), async (req, res) => {
  const { id } = req.params;

  const data = await getGenreById(id);
  return res.status(200).json({ message: 'Genre fetched successfully', data });
});

export default router;
