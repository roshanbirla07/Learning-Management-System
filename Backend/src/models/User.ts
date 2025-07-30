import mongoose, { Document, Schema } from 'mongoose';

export interface CompletedLesson {
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  enrolledCourses: mongoose.Types.ObjectId[];
  completedLessons: CompletedLesson[];
  quizAttempts: mongoose.Types.ObjectId[];
}

const completedLessonSchema = new Schema<CompletedLesson>({
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
}, { _id: false });

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  completedLessons: [completedLessonSchema],
  quizAttempts: [{ type: Schema.Types.ObjectId, ref: 'QuizAttempt' }],
}, { timestamps: true });

const User = mongoose.model<UserDocument>('User', userSchema);
export default User; 