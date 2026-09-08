import { Router } from 'express';

import adminRouter from './admin';
import authRouter from './auth.route';
import movieRouter from './movie.route';
import genreRouter from './genre.route';
import showtimeRouter from './showtime.route';
import theaterRouter from './theater.route';
import reservationRouter from './reservation.route';

import { uploadDir } from '../configs/upload';
import { Role } from '../generated/prisma/enums';

import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRouter);
router.use('/movies', movieRouter);
router.use('/genres', genreRouter);
router.use('/showtimes', showtimeRouter);
router.use('/theaters', theaterRouter);
router.use('/reservations', reservationRouter);

router.use('/admin', requireAuth, requireRole(Role.ADMIN), adminRouter);

router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(filename, { root: uploadDir }, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

export default router;
