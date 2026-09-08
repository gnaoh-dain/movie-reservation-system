import { Router } from 'express';
import { validate } from '../middlewares/validations';
import { movieParams, listMoviesQuery } from '../middlewares/validations/movie.validate';
import { listMovies, getMovieById } from '../services/movie.service';

const router = Router();

router.get('/', validate({ query: listMoviesQuery }), async (req, res) => {
  const { page, limit, genreId, search, orderBy } = req.query;

  const data = await listMovies({ page, limit, genreId, search, orderBy });
  return res.status(200).json({ message: 'Movies fetched successfully', data });
});

router.get('/:id', validate({ params: movieParams }), async (req, res) => {
  const { id } = req.params;

  const data = await getMovieById(id);
  return res.status(200).json({ message: 'Movie fetched successfully', data });
});

export default router;
