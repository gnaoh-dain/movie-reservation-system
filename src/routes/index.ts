import { Router } from 'express';
import authRouter from './auth.route';
import movieRouter from './movie.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/movies', movieRouter);

router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(filename, { root: 'uploads' }, (err) => {
    if (err) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

export default router;
