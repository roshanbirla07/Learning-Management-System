import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import courseRoutes from './routes/course';
import lessonRoutes from './routes/lesson';
import quizRoutes from './routes/quiz';
import progressRoutes from './routes/progress';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Building the backend of Learning Management System' });
});

export default app;
