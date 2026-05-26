import mongoose, { Document, Schema } from 'mongoose';
import { matchDb } from '../config/db';

export interface IPushTokenDocument extends Document {
  userId: string;
  token: string;
}

const PushTokenSchema = new Schema<IPushTokenDocument>(
  {
    userId: { type: String, required: true, unique: true },
    token: { type: String, required: true },
  },
  { timestamps: true },
);

export default matchDb.model<IPushTokenDocument>('PushToken', PushTokenSchema);
