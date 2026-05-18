import mongoose, { Document, Schema } from 'mongoose';
import { Gender } from '../types';

export interface IUserDocument extends Document {
  mobile: string;
  name: string;
  gender: Gender;
  age: number;
  city: string;
  bio: string;
  isActive: boolean;
  role: 'user' | 'admin';
  lastLogin: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    mobile: { type: String, required: true, unique: true, trim: true },
    name: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female'], default: null },
    age: { type: Number, default: null },
    city: { type: String, default: '', trim: true },
    bio: { type: String, default: '', trim: true, maxlength: 200 },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<IUserDocument>('User', UserSchema);
