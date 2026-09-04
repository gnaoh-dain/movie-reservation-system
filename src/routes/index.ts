import { Router } from 'express';
import authRouter from './auth.route';
import movieRouter from './movie.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/movies', movieRouter);

export default router;
