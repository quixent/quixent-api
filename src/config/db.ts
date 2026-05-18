import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not set in .env');
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');
};
