import { Router, Request, Response } from 'express';
import matchRoutes from './src/routes/match.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, status: 'ok', module: 'match-calculator' });
});

router.get('/test', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Match Calculator module is working' });
});

router.use('/', matchRoutes);

export default router;
