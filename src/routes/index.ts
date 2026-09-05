import { Router } from 'express';
import authRouter from './auth.route';
import movieRouter from './movie.route';
import { uploadDir } from '../configs/upload';

const router = Router();

router.use('/auth', authRouter);
router.use('/movies', movieRouter);

router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(filename, { root: uploadDir }, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

export default router;
