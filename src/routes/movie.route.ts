import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma/enums';

const router = Router();

router.get('/', requireAuth, requireRole(Role.ADMIN), (req, res) => {
  try {
    return res.status(200).json({ message: 'Movie route is working' });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.get('/:id', requireAuth, requireRole(Role.ADMIN), (req, res) => {
  try {
    const { id } = req.params;
    return res.status(200).json({ message: `Movie route is working for movie with id ${id}` });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.post('/', requireAuth, requireRole(Role.ADMIN), (req, res) => {
  try {
    const { title, description } = req.body;
    return res.status(200).json({
      message: `Movie route is working for creating movie with title ${title} and description ${description}`,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.put('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    return res.status(200).json({
      message: `Movie route is working for updating movie with id ${id}, title ${title} and description ${description}`,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    return res.status(200).json({ message: `Movie route is working for deleting movie with id ${id}` });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export default router;
