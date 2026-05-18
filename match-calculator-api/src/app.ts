import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import matchRouter from './routes/match.routes';
import questionRouter from './routes/question.routes';
import { seedQuestions } from './seed';

const app = express();
const PORT = process.env.PORT ?? 5001;

const allowedOrigins = (process.env.CLIENT_ORIGINS ?? 'http://localhost:3000,http://localhost:8081').split(',').map((o) => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/match', matchRouter);
app.use('/questions', questionRouter);

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', project: 'match-calculator' });
});

async function start() {
  await connectDB();
  await seedQuestions();
  app.listen(PORT, () => {
    console.log(`🚀 Match Calculator API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
