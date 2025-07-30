import { Router } from 'express';
import courseController from '../controllers/courseController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, requireRole('admin'), courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/:id/enroll', authenticateJWT, requireRole('user'), courseController.enrollInCourse);

export default router;