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
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbState[mongoose.connection.readyState] ?? 'unknown',
  });
});

app.get('/test', async (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  let dbPing = false;
  if (dbConnected) {
    try {
      await mongoose.connection.db!.admin().ping();
      dbPing = true;
    } catch {
      dbPing = false;
    }
  }
  const allOk = dbConnected && dbPing;
  res.status(allOk ? 200 : 503).json({
    success: allOk,
    message: allOk ? 'All systems operational' : 'Some checks failed',
    checks: {
      api: 'ok',
      database: dbConnected ? 'ok' : 'error',
      dbPing: dbPing ? 'ok' : 'error',
    },
    timestamp: new Date().toISOString(),
  });
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
