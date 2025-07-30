import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import { Request, Response } from 'express';

interface QuizAttemptRequest extends AuthRequest {
  params: {
    id: string;
  };
  body: {
    answers: Array<{
      questionId: number;
      selectedOption: string;
    }>;
  };
}

interface GetAttemptsRequest extends AuthRequest {
  params: {
    id: string;
  };
}

const attemptQuiz = async (req: QuizAttemptRequest, res: any) => {
  try {
    const { id: quizId } = req.query;
    const { answers } = req.body;
    const userId = req.user?.userId;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to take quizzes' });
    }

    // Validate answers format
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers must be provided as an array' });
    }

    // Calculate score and create summary
    let correctAnswers = 0;
    const summary = [];

    for (const answer of answers) {
      const question = quiz.questions[answer.questionId];
      if (!question) {
        return res.status(400).json({ message: `Invalid question ID: ${answer.questionId}` });
      }

      const isCorrect = answer.selectedOption === question.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
      }

      summary.push({
        questionId: answer.questionId,
        userOption: answer.selectedOption,
        correctOption: question.correctAnswer,
        isCorrect,
      });
    }

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      user: userId,
      quiz: quizId,
      answers,
      score,
      summary,
    });

    await quizAttempt.save();

    // Update enrollment with quiz attempt
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      $addToSet: { quizAttempts: quizAttempt._id },
    });

    // Update user's quiz attempts
    await User.findByIdAndUpdate(userId, {
      $addToSet: { quizAttempts: quizAttempt._id },
    });

    res.status(201).json({
      message: 'Quiz attempt submitted successfully',
      attempt: {
        id: quizAttempt._id,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        summary,
        attemptDate: quizAttempt.attemptDate,
      },
    });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getQuizAttempts = async (req: GetAttemptsRequest, res: any) => {
  try {
    const { id: quizId } = req.query;
    const userId = req.user?.userId;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get all attempts for this user and quiz
    const attempts = await QuizAttempt.find({
      user: userId,
      quiz: quizId,
    }).sort({ attemptDate: -1 });

    res.json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        totalQuestions: quiz.questions.length,
      },
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        score: attempt.score,
        attemptDate: attempt.attemptDate,
        summary: attempt.summary,
      })),
      totalAttempts: attempts.length,
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createQuizForCourse = async (req: Request, res: Response) => {
  try {
    // Get courseId from query params instead of req.params
    const { id: courseId } = req.query;
    const { title, questions } = req.body;
    console.log('Looking for course:', courseId);
    if (!courseId || typeof courseId !== 'string') {
      return res.status(400).json({ message: 'Course ID is required in query params as ?id=COURSE_ID' });
    }

    // Format questions to match model requirements
    const formattedQuestions = questions.map((q: { questionText: string; options: string[]; correctOption: number }) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctOption, 
    }));

    // Create the quiz with course reference
    const quiz = new Quiz({ title, questions: formattedQuestions, course: courseId });
    await quiz.save();

    // Add quiz reference to the course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.quizzes.push(quiz._id as import('mongoose').Types.ObjectId);
    await course.save();

    res.status(201).json({ message: 'Quiz created and added to course', quiz });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find();
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found' });
    }
    res.json(quizzes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export default {
  attemptQuiz,
  getQuizAttempts,
  createQuizForCourse,
  getAllQuizzes,
};