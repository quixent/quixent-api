import mongoose, { Document, Schema } from 'mongoose';

export interface IOtpDocument extends Document {
  mobile: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}

const OtpSchema = new Schema<IOtpDocument>({
  mobile: { type: String, required: true, trim: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtpDocument>('Otp', OtpSchema);
