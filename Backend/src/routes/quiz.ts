import { Router } from 'express';
import quizController from '../controllers/quizController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Use query params for all routes instead of URL params
router.post('/attempt', authenticateJWT, quizController.attemptQuiz);
router.get('/attempts', authenticateJWT, quizController.getQuizAttempts);
router.post(
  '/createQuiz',
  authenticateJWT,
  requireRole('admin'),
  quizController.createQuizForCourse
);
router.get('/', quizController.getAllQuizzes);

export default router;