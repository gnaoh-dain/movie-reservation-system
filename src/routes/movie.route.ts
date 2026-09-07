import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma/enums';
import { validate } from '../middlewares/validations';
import { upload } from '../configs/upload';
import {
  movieParams,
  listMoviesQuery,
  createMovieBody,
  updateMovieBody,
} from '../middlewares/validations/movie.validate';
import { listMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../services/movie.service';

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

router.post(
  '/',
  requireAuth,
  requireRole(Role.ADMIN),
  upload.single('poster'),
  validate({ body: createMovieBody }),
  async (req, res) => {
    const { title, description, genreId } = req.body;

    const data = await createMovie({ title, description, genreId, posterImageId: req.file?.filename });
    return res.status(201).json({ message: 'Movie created successfully', data });
  },
);

router.put(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  upload.single('poster'),
  validate({ params: movieParams, body: updateMovieBody }),
  async (req, res) => {
    const { id } = req.params;
    const { title, description, genreId } = req.body;

    const data = await updateMovie(id, { title, description, genreId }, req.file?.filename);
    return res.status(200).json({ message: 'Movie updated successfully', data });
  },
);

router.delete('/:id', requireAuth, requireRole(Role.ADMIN), validate({ params: movieParams }), async (req, res) => {
  const { id } = req.params;

  const data = await deleteMovie(id);
  return res.status(200).json({ message: 'Movie deleted successfully', data });
});

export default router;
