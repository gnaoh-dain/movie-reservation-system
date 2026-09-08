import { Router } from 'express';
import adminMovieRouter from './movie.route';
import adminGenreRouter from './genre.route';
import adminShowtimeRouter from './showtime.route';
import adminTheaterRouter from './theater.route';

const adminRouter = Router();

adminRouter.use('/movies', adminMovieRouter);
adminRouter.use('/genres', adminGenreRouter);
adminRouter.use('/showtimes', adminShowtimeRouter);
adminRouter.use('/theaters', adminTheaterRouter);

export default adminRouter;
