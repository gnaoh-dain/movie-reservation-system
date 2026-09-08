import { Router } from 'express';
import { validate } from '../middlewares/validations';
import { reservationBody } from '../middlewares/validations/reservation.validate';
import { requireAuth } from '../middlewares/auth.middleware';
import { createReservation } from '../services/reservation.service';

const router = Router();

router.post('/', requireAuth, validate({ body: reservationBody }), async (req, res) => {
  const { userId } = res.locals.user;
  const { showtimeId, seatIds } = req.body;

  const data = await createReservation(userId, { showtimeId, seatIds });
  return res.status(201).json({ message: 'Reservation created successfully', data });
});

export default router;
