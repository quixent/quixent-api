import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { connectDB } from './config/db';
import authRouter from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT ?? 5000;

const allowedOrigins = (process.env.CLIENT_ORIGINS ?? '').split(',').map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use('/api/match', createProxyMiddleware({
  target: process.env.MATCH_API_URL ?? 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: { '^/api/match': '/match' },
}));

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: Math.floor(process.uptime()) });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
