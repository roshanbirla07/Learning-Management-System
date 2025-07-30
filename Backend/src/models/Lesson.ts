import mongoose, { Document, Schema } from 'mongoose';

export interface LessonDocument extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  videoURL: string;
  optionalResourceLinks: string[];
}

const lessonSchema = new Schema<LessonDocument>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  videoURL: { type: String, required: true },
  optionalResourceLinks: [{ type: String }],
}, { timestamps: true });

const Lesson = mongoose.model<LessonDocument>('Lesson', lessonSchema);
export default Lesson; 