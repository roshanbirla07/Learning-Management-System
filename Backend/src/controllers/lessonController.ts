import { Request,Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import Lesson from '../models/Lesson';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';

interface CompleteLessonRequest extends AuthRequest {
  query: {
    id: string;
  };
}

const completeLesson = async (req: CompleteLessonRequest, res: Response) => {
  try {
    const { id: lessonId } = req.query;
    const userId = req.user?.userId;

    if (!lessonId || typeof lessonId !== 'string') {
      return res.status(400).json({ message: 'Lesson ID is required in query params as ?id=LESSON_ID' });
    }

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: lesson.course,
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to complete lessons' });
    }

    // Check if lesson is already completed
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    const isAlreadyCompleted = enrollment.completedLessons.includes(lessonObjectId);
    if (isAlreadyCompleted) {
      return res.status(400).json({ message: 'Lesson already completed' });
    }

    // Add lesson to completed lessons
    enrollment.completedLessons.push(lessonObjectId);

    // Calculate progress percentage
    const course = await Course.findById(lesson.course).populate('lessons');
    if (course && course.lessons) {
      const totalLessons = course.lessons.length;
      const completedLessons = enrollment.completedLessons.length;
      enrollment.progressPercent = Math.round((completedLessons / totalLessons) * 100);
    }

    await enrollment.save();

    // Update user's completed lessons
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        completedLessons: {
          lesson: lessonId,
          course: lesson.course,
        },
      },
    });

    res.json({
      message: 'Lesson completed successfully',
      lesson: {
        id: lesson._id,
        title: lesson.title,
        courseId: lesson.course,
      },
      progress: {
        completedLessons: enrollment.completedLessons.length,
        progressPercent: enrollment.progressPercent,
      },
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const addLessonToCourse = async (req: Request, res: Response) => {
  try {
    const { id: courseId } = req.query ;
    const { title, videoURL, resourceLinks } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lesson = new Lesson({ title, videoURL, resourceLinks, course: courseId });
    await lesson.save();

    course.lessons.push(lesson._id as import('mongoose').Types.ObjectId);
    await course.save();

    res.status(201).json({ message: 'Lesson added to course', lesson });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export default { completeLesson , addLessonToCourse };