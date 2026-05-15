import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import matchRouter from './routes/match';
import { seedQuestions } from './seed';

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/match', matchRouter);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Matchmaking API running' });
});

async function dropStaleIndexes() {
  try {
    const collection = mongoose.connection.collection('matches');
    const indexes = await collection.indexes();
    if (indexes.some((idx) => idx.name === 'matchCode_1')) {
      await collection.dropIndex('matchCode_1');
      console.log('✅ Dropped stale matchCode_1 index');
    }
  } catch {
    // Index already gone — safe to ignore
  }
}

async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not set in .env');

  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');

  await dropStaleIndexes();
  await seedQuestions();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
