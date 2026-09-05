import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma/enums';
import { validate } from '../middlewares/validations';
import {
  movieParams,
  listMoviesQuery,
  createMovieBody,
  updateMovieBody,
} from '../middlewares/validations/movie.validate';
import { listMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../services/movie.service';

const router = Router();

router.get('/', requireAuth, requireRole(Role.ADMIN), validate({ query: listMoviesQuery }), async (req, res) => {
  const data = await listMovies(req.query);
  return res.status(200).json({ message: 'Movies fetched successfully', data });
});

router.get('/:id', requireAuth, requireRole(Role.ADMIN), validate({ params: movieParams }), async (req, res) => {
  const data = await getMovieById(req.params.id);
  if (!data) return res.status(404).json({ error: 'MovieNotFound' });

  return res.status(200).json({ message: 'Movie fetched successfully', data });
});

router.post('/', requireAuth, requireRole(Role.ADMIN), validate({ body: createMovieBody }), async (req, res) => {
  const data = await createMovie(req.body);
  return res.status(201).json({ message: 'Movie created successfully', data });
});

router.put(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  validate({ params: movieParams, body: updateMovieBody }),
  async (req, res) => {
    const data = await updateMovie(req.params.id, req.body);
    return res.status(200).json({ message: 'Movie updated successfully', data });
  },
);

router.delete('/:id', requireAuth, requireRole(Role.ADMIN), validate({ params: movieParams }), async (req, res) => {
  const data = await deleteMovie(req.params.id);
  return res.status(200).json({ message: 'Movie deleted successfully', data });
});

export default router;
