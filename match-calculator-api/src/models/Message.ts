import mongoose, { Document, Schema } from 'mongoose';
import { matchDb } from '../config/db';

export interface IMessageDocument extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

MessageSchema.index({ matchId: 1, createdAt: 1 });

export default matchDb.model<IMessageDocument>('Message', MessageSchema);
