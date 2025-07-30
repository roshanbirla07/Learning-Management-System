import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import QuizAttempt from '../models/QuizAttempt';

const getUserProgress = async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId;

    // Get user with populated data
    const user = await User.findById(userId)
      .populate('enrolledCourses')
      .populate('completedLessons.lesson')
      .populate('completedLessons.course')
      .populate('quizAttempts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all enrollments with detailed course information
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course')
      .populate('completedLessons')
      .populate({
        path: 'quizAttempts',
        populate: {
          path: 'quiz',
          select: 'title questions',
        },
      });

    // Calculate overall statistics
    const totalEnrolledCourses = enrollments.length;
    const totalCompletedLessons = user.completedLessons.length;
    const totalQuizAttempts = user.quizAttempts.length;

    // Calculate average quiz score
    let totalQuizScore = 0;
    let totalQuizzesTaken = 0;

    for (const enrollment of enrollments) {
      if (enrollment.quizAttempts && enrollment.quizAttempts.length > 0) {
        for (const attempt of enrollment.quizAttempts) {
          const attemptDoc = attempt as any;
          totalQuizScore += attemptDoc.score;
          totalQuizzesTaken++;
        }
      }
    }

    const averageQuizScore = totalQuizzesTaken > 0 ? Math.round(totalQuizScore / totalQuizzesTaken) : 0;

    // Prepare course-wise progress
    const courseProgress = enrollments.map(enrollment => {
      const course = enrollment.course as any;
      const completedLessonsCount = enrollment.completedLessons.length;
      const totalLessonsInCourse = course.lessons ? course.lessons.length : 0;
      const courseProgressPercent = totalLessonsInCourse > 0 
        ? Math.round((completedLessonsCount / totalLessonsInCourse) * 100)
        : 0;

      // Get quiz attempts for this course
      const courseQuizAttempts = enrollment.quizAttempts || [];
      const courseQuizScores = courseQuizAttempts.map((attempt: any) => attempt.score);
      const averageCourseQuizScore = courseQuizScores.length > 0 
        ? Math.round(courseQuizScores.reduce((a: number, b: number) => a + b, 0) / courseQuizScores.length)
        : 0;

      return {
        courseId: course._id,
        courseTitle: course.title,
        courseDescription: course.description,
        instructorName: course.instructorName,
        progressPercent: enrollment.progressPercent,
        completedLessons: completedLessonsCount,
        totalLessons: totalLessonsInCourse,
        quizAttempts: courseQuizAttempts.length,
        averageQuizScore: averageCourseQuizScore,
        lastActivity: (enrollment as any).updatedAt,
      };
    });

    // Get recent activity (last 10 completed lessons)
    const recentLessons = user.completedLessons
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((completedLesson: any) => ({
        lessonId: completedLesson.lesson._id,
        lessonTitle: completedLesson.lesson.title,
        courseId: completedLesson.course._id,
        courseTitle: completedLesson.course.title,
        completedAt: completedLesson.updatedAt,
      }));

    // Get recent quiz attempts (last 10)
    const recentQuizAttempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title')
      .sort({ attemptDate: -1 })
      .limit(10)
      .then(attempts => attempts.map(attempt => ({
        attemptId: attempt._id,
        quizId: (attempt.quiz as any)._id,
        quizTitle: (attempt.quiz as any).title,
        score: attempt.score,
        attemptDate: attempt.attemptDate,
      })));

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      overallStats: {
        totalEnrolledCourses,
        totalCompletedLessons,
        totalQuizAttempts,
        averageQuizScore,
      },
      courseProgress,
      recentActivity: {
        lessons: recentLessons,
        quizAttempts: recentQuizAttempts,
      },
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default { getUserProgress }; 