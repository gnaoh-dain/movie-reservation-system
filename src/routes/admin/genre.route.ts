import { Router } from 'express';
import { validate } from '../../middlewares/validations';
import { genreParams, genreBody } from '../../middlewares/validations/genre.validate';
import { createGenre, updateGenre, deleteGenre } from '../../services/genre.service';

const router = Router();

router.post('/', validate({ body: genreBody }), async (req, res) => {
  const { name } = req.body;

  const data = await createGenre(name);
  return res.status(201).json({ message: 'Genre created successfully', data });
});

router.put('/:id', validate({ params: genreParams, body: genreBody }), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const data = await updateGenre(id, name);
  return res.status(200).json({ message: 'Genre updated successfully', data });
});

router.delete('/:id', validate({ params: genreParams }), async (req, res) => {
  const { id } = req.params;

  const data = await deleteGenre(id);
  return res.status(200).json({ message: 'Genre deleted successfully', data });
});

export default router;
