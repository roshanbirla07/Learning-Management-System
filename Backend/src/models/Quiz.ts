import mongoose, { Document, Schema } from 'mongoose';

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizDocument extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  questions: Question[];
}

const questionSchema = new Schema<Question>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
}, { _id: false });

const quizSchema = new Schema<QuizDocument>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  questions: [questionSchema],
}, { timestamps: true });

const Quiz = mongoose.model<QuizDocument>('Quiz', quizSchema);
export default Quiz; 