import mongoose, { Connection } from 'mongoose';

export let authDb: Connection;

export const connectAuthDB = async (): Promise<void> => {
  const mongoUri = process.env.AUTH_MONGO_URI;
  if (!mongoUri) throw new Error('AUTH_MONGO_URI is not set in .env');
  authDb = mongoose.createConnection(mongoUri);
  await authDb.asPromise();
  console.log('✅ Auth MongoDB connected');
};
