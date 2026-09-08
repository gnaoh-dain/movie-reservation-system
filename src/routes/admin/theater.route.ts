import { Router } from 'express';
import { validate } from '../../middlewares/validations';
import { theaterParams, theaterBody, layoutBody } from '../../middlewares/validations/theater.validate';
import { createTheater, replaceLayout, updateTheater } from '../../services/theater.service';

const router = Router();

router.post('/', validate({ body: theaterBody }), async (req, res) => {
  const { name } = req.body;

  const data = await createTheater(name);
  return res.status(201).json({ message: 'Theater created successfully', data });
});

router.put('/:theaterId', validate({ params: theaterParams, body: theaterBody }), async (req, res) => {
  const { theaterId } = req.params;
  const { name } = req.body;

  const data = await updateTheater(theaterId, name);
  return res.status(200).json({ message: 'Theater updated successfully', data });
});

router.put('/:theaterId/layout', validate({ params: theaterParams, body: layoutBody }), async (req, res) => {
  const { theaterId } = req.params;
  const { rows } = req.body;

  const data = await replaceLayout(theaterId, rows);
  return res.status(200).json({ message: 'Layout saved successfully', data });
});

export default router;
