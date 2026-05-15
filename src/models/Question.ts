import mongoose, { Document, Schema } from 'mongoose';

export interface IOptionSubDoc {
  _id: mongoose.Types.ObjectId;
  text: string;
  weight: number;
}

export interface IQuestionDocument extends Document {
  text: string;
  order: number;
  options: IOptionSubDoc[];
}

const OptionSchema = new Schema<IOptionSubDoc>({
  text: { type: String, required: true },
  weight: { type: Number, required: true, min: 1, max: 5 },
});

const QuestionSchema = new Schema<IQuestionDocument>({
  text: { type: String, required: true },
  order: { type: Number, required: true, unique: true },
  options: { type: [OptionSchema], required: true },
});

export default mongoose.model<IQuestionDocument>('Question', QuestionSchema);
