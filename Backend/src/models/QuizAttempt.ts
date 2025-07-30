import mongoose, { Document, Schema } from 'mongoose';

export interface Answer {
  questionId: number;
  selectedOption: string;
}

export interface Summary {
  questionId: number;
  userOption: string;
  correctOption: string;
  isCorrect: boolean;
}

export interface QuizAttemptDocument extends Document {
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  answers: Answer[];
  score: number;
  summary: Summary[];
  attemptDate: Date;
}

const answerSchema = new Schema<Answer>({
  questionId: { type: Number, required: true },
  selectedOption: { type: String, required: true },
}, { _id: false });

const summarySchema = new Schema<Summary>({
  questionId: { type: Number, required: true },
  userOption: { type: String, required: true },
  correctOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
}, { _id: false });

const quizAttemptSchema = new Schema<QuizAttemptDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [answerSchema],
  score: { type: Number, required: true },
  summary: [summarySchema],
  attemptDate: { type: Date, default: Date.now },
}, { timestamps: true });

const QuizAttempt = mongoose.model<QuizAttemptDocument>('QuizAttempt', quizAttemptSchema);
export default QuizAttempt; 