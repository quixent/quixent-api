import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectAuthDB } from './auth/src/config/db';
import { connectMatchDB } from './match-calculator-api/src/config/db';

async function start() {
  await Promise.all([connectAuthDB(), connectMatchDB()]);

  // Dynamic imports run after both DBs are connected so model files
  // can safely call authDb.model() / matchDb.model() at evaluation time.
  const { default: authRouter } = await import('./auth/index');
  const { default: matchRouter } = await import('./match-calculator-api/index');
  const { errorHandler } = await import('./auth/src/middleware/errorHandler');

  const app = express();
  const PORT = process.env.PORT ?? 5002;
  const allowedOrigins = (process.env.CLIENT_ORIGINS ?? '').split(',').map((o) => o.trim());

  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ success: true, status: 'ok', uptime: Math.floor(process.uptime()) });
  });

  app.get('/test', (_req, res) => {
    res.json({ success: true, message: 'Quixent API is working' });
  });

  app.use('/auth', authRouter);
  app.use('/match', matchRouter);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Quixent API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
