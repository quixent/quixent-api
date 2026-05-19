import mongoose, { Document, Schema } from 'mongoose';
import { matchDb } from '../config/db';

export interface IConnectCodeDocument extends Document {
  userId: string;
  code: string;
  expiresAt: Date;
}

const ConnectCodeSchema = new Schema<IConnectCodeDocument>(
  {
    userId: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

ConnectCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default matchDb.model<IConnectCodeDocument>('ConnectCode', ConnectCodeSchema);
