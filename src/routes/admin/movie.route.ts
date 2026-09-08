import { Router } from 'express';
import { validate } from '../../middlewares/validations';
import { upload } from '../../configs/upload';
import { movieParams, createMovieBody, updateMovieBody } from '../../middlewares/validations/movie.validate';
import { createMovie, updateMovie, deleteMovie } from '../../services/movie.service';

const router = Router();

router.post('/', upload.single('poster'), validate({ body: createMovieBody }), async (req, res) => {
  const { title, description, genreId } = req.body;

  const data = await createMovie({ title, description, genreId, posterImageId: req.file?.filename });
  return res.status(201).json({ message: 'Movie created successfully', data });
});

router.put(
  '/:id',
  upload.single('poster'),
  validate({ params: movieParams, body: updateMovieBody }),
  async (req, res) => {
    const { id } = req.params;
    const { title, description, genreId } = req.body;

    const data = await updateMovie(id, { title, description, genreId }, req.file?.filename);
    return res.status(200).json({ message: 'Movie updated successfully', data });
  },
);

router.delete('/:id', validate({ params: movieParams }), async (req, res) => {
  const { id } = req.params;

  const data = await deleteMovie(id);
  return res.status(200).json({ message: 'Movie deleted successfully', data });
});

export default router;
