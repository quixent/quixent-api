import mongoose, { Document, Schema } from 'mongoose';
import { MatchStatus } from '../types';
import { matchDb } from '../config/db';

export interface IMatchDocument extends Document {
  senderId: string;
  receiverId: string;
  status: MatchStatus;
  compatibilityScore: number | null;
  createdAt: Date;
}

const MatchSchema = new Schema<IMatchDocument>(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'complete'],
      default: 'requested',
    },
    compatibilityScore: { type: Number, default: null },
  },
  { timestamps: true },
);

MatchSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default matchDb.model<IMatchDocument>('Match', MatchSchema);
