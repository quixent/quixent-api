import mongoose, { Connection } from 'mongoose';

export let matchDb: Connection;

export const connectMatchDB = async (): Promise<void> => {
  const mongoUri = process.env.MATCH_MONGO_URI;
  if (!mongoUri) throw new Error('MATCH_MONGO_URI is not set in .env');
  matchDb = mongoose.createConnection(mongoUri);
  await matchDb.asPromise();
  console.log('✅ Match MongoDB connected');
};
