import mongoose, { Document, Schema } from 'mongoose';

export interface IOtpDocument extends Document {
  mobile: string;
  code: string;
  attempts: number;
  expiresAt: Date;
}

const OtpSchema = new Schema<IOtpDocument>({
  mobile: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtpDocument>('Otp', OtpSchema);
