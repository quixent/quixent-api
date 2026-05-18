import { Request, Response, NextFunction } from 'express';

const WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

const store = new Map<string, { count: number; resetAt: number }>();

export const otpRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip  = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const now = Date.now();

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
    res.status(429).json({
      success: false,
      message: `Too many OTP requests. Try again in ${retryAfterSecs} seconds.`,
      error: 'RATE_LIMIT_EXCEEDED',
    });
    return;
  }

  entry.count += 1;
  next();
};
