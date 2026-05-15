import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageDocument extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

MessageSchema.index({ matchId: 1, createdAt: 1 });

export default mongoose.model<IMessageDocument>('Message', MessageSchema);
