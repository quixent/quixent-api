import mongoose, { Document, Schema } from 'mongoose';
import { matchDb } from '../config/db';

export interface IAnswerDocument extends Document {
  matchId: mongoose.Types.ObjectId;
  userId: string;
  questionId: mongoose.Types.ObjectId;
  optionId: mongoose.Types.ObjectId;
}

const AnswerSchema = new Schema<IAnswerDocument>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    userId: { type: String, required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    optionId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

AnswerSchema.index({ matchId: 1, userId: 1, questionId: 1 }, { unique: true });

export default matchDb.model<IAnswerDocument>('Answer', AnswerSchema);
