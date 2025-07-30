import mongoose, { Document, Schema } from 'mongoose';

export interface CourseDocument extends Document {
  title: string;
  description: string;
  instructorName: string;
  price: number;
  lessons: mongoose.Types.ObjectId[];
  quizzes: mongoose.Types.ObjectId[];
  enrolledUsers: mongoose.Types.ObjectId[];
}

const courseSchema = new Schema<CourseDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructorName: { type: String, required: true },
  price: { type: Number, required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
  enrolledUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Course = mongoose.model<CourseDocument>('Course', courseSchema);
export default Course; 