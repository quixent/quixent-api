import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status  = err.status  ?? 500;
  const message = err.message ?? 'Internal server error';
  const error   = err.error   ?? 'SERVER_ERROR';

  if (status >= 500) {
    console.error(`[ERROR] ${status} — ${message}`, err.stack ?? '');
  }

  res.status(status).json({
    success: false,
    message,
    error,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
