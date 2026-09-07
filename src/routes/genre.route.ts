import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma/enums';
import { validate } from '../middlewares/validations';
import { genreParams, listGenresQuery, genreBody } from '../middlewares/validations/genre.validate';
import { listGenres, getGenreById, createGenre, updateGenre, deleteGenre } from '../services/genre.service';

const router = Router();

router.get('/', requireAuth, validate({ query: listGenresQuery }), async (req, res) => {
  const data = await listGenres(req.query);
  return res.status(200).json({ message: 'Genres fetched successfully', data });
});

router.get('/:id', requireAuth, validate({ params: genreParams }), async (req, res) => {
  const data = await getGenreById(req.params.id);
  if (!data) return res.status(404).json({ error: 'GenreNotFound' });

  return res.status(200).json({ message: 'Genre fetched successfully', data });
});

router.post('/', requireAuth, requireRole(Role.ADMIN), validate({ body: genreBody }), async (req, res) => {
  const data = await createGenre(req.body.name);
  if (!data) return res.status(409).json({ error: 'GenreAlreadyExists' });

  return res.status(201).json({ message: 'Genre created successfully', data });
});

router.put(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  validate({ params: genreParams, body: genreBody }),
  async (req, res) => {
    const data = await updateGenre(req.params.id, req.body.name);
    if (!data) return res.status(404).json({ error: 'GenreNotFound' });

    return res.status(200).json({ message: 'Genre updated successfully', data });
  },
);

router.delete('/:id', requireAuth, requireRole(Role.ADMIN), validate({ params: genreParams }), async (req, res) => {
  const data = await deleteGenre(req.params.id);
  if (!data) return res.status(404).json({ error: 'GenreNotFound' });

  return res.status(200).json({ message: 'Genre deleted successfully', data });
});

export default router;
