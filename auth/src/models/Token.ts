import mongoose, { Document, Schema } from 'mongoose';
import { authDb } from '../config/db';

export interface ITokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const TokenSchema = new Schema<ITokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default authDb.model<ITokenDocument>('Token', TokenSchema);
