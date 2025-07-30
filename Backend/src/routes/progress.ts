import { Router } from 'express';
import progressController from '../controllers/progressController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, progressController.getUserProgress);

export default router; 