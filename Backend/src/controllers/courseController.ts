import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import User from '../models/User';
import Enrollment from '../models/Enrollment';


interface CreateCourseRequest extends AuthRequest {
  body: {
    title: string;
    description: string;
    instructorName: string;
    price: number;
  };
}

interface EnrollRequest extends AuthRequest {
  params: {
    id: string;
  };
}

const createCourse = async (req: CreateCourseRequest, res: Response) => {
  try {
    const { title, description, instructorName, price } = req.body;

    const course = new Course({
      title,
      description,
      instructorName,
      price,
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        instructorName: course.instructorName,
        price: course.price,
      },
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllCourses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .populate('lessons', 'title')
      .populate('quizzes', 'title')
      .skip(skip)
      .limit(limit)
      .select('-enrolledUsers');

    const total = await Course.countDocuments();

    res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('lessons', 'title videoURL optionalResourceLinks')
      .populate('quizzes', 'title questions')
      .populate('enrolledUsers', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const enrollInCourse = async (req: EnrollRequest, res: Response) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user?.userId;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
    });

    await enrollment.save();

    // Update course enrolled users
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledUsers: userId },
    });

    // Update user enrolled courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment: {
        id: enrollment._id,
        courseId: enrollment.course,
        userId: enrollment.user,
        progressPercent: enrollment.progressPercent,
      },
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export default { createCourse, getAllCourses, getCourseById, enrollInCourse };