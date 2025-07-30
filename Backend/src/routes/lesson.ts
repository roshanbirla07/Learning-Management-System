import { Router } from 'express';
import lessonController from '../controllers/lessonController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.post('/create', authenticateJWT, requireRole('admin'), lessonController.addLessonToCourse);

router.post('/complete', authenticateJWT, lessonController.completeLesson);

export default router; 