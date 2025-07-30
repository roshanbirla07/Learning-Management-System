import mongoose, { Document, Schema } from 'mongoose';

export interface EnrollmentDocument extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  quizAttempts: mongoose.Types.ObjectId[];
  progressPercent: number;
}

const enrollmentSchema = new Schema<EnrollmentDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  quizAttempts: [{ type: Schema.Types.ObjectId, ref: 'QuizAttempt' }],
  progressPercent: { type: Number, default: 0 },
}, { timestamps: true });

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model<EnrollmentDocument>('Enrollment', enrollmentSchema);
export default Enrollment; 