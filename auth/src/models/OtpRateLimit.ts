import { Document, Schema } from 'mongoose';
import { authDb } from '../config/db';

export interface IOtpRateLimit extends Document {
  mobile: string;
  lastRequestAt: Date;
  dailyRequestCount: number;
  expiresAt: Date;
}

const OtpRateLimitSchema = new Schema<IOtpRateLimit>({
  mobile: { type: String, required: true, unique: true, index: true },
  lastRequestAt: { type: Date, required: true, default: Date.now },
  dailyRequestCount: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

// Auto-delete after 24 hours
OtpRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default authDb.model<IOtpRateLimit>('OtpRateLimit', OtpRateLimitSchema);
