import mongoose, { Document, Schema } from 'mongoose';
import { matchDb } from '../config/db';

export interface IOptionDocument {
  _id: mongoose.Types.ObjectId;
  text: string;
  weight: number;
}

export interface IQuestionDocument extends Document {
  text: string;
  order: number;
  options: IOptionDocument[];
}

const OptionSchema = new Schema<IOptionDocument>({
  text: { type: String, required: true },
  weight: { type: Number, required: true },
});

const QuestionSchema = new Schema<IQuestionDocument>({
  text: { type: String, required: true },
  order: { type: Number, required: true, unique: true },
  options: { type: [OptionSchema], required: true },
});

export default matchDb.model<IQuestionDocument>('Question', QuestionSchema);
