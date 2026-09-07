import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma/enums';
import { validate } from '../middlewares/validations';
import { genreParams, listGenresQuery, genreBody } from '../middlewares/validations/genre.validate';
import { listGenres, getGenreById, createGenre, updateGenre, deleteGenre } from '../services/genre.service';

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

router.post('/', requireAuth, requireRole(Role.ADMIN), validate({ body: genreBody }), async (req, res) => {
  const { name } = req.body;

  const data = await createGenre(name);
  return res.status(201).json({ message: 'Genre created successfully', data });
});

router.put(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  validate({ params: genreParams, body: genreBody }),
  async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const data = await updateGenre(id, name);
    return res.status(200).json({ message: 'Genre updated successfully', data });
  },
);

router.delete('/:id', requireAuth, requireRole(Role.ADMIN), validate({ params: genreParams }), async (req, res) => {
  const { id } = req.params;

  const data = await deleteGenre(id);
  return res.status(200).json({ message: 'Genre deleted successfully', data });
});

export default router;
