import { Router, Request, Response } from 'express';
import authRoutes from './src/routes/auth.routes';

const router = Router();

router.use('/', authRoutes);

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, status: 'ok', module: 'auth' });
});

router.get('/test', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Auth module is working' });
});

export default router;
