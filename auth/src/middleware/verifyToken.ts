import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided', error: 'TOKEN_MISSING' });
    return;
  }

  const token = header.split(' ')[1];
  const secrets = [
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_SECRET,
  ].filter(Boolean) as string[];

  for (const secret of secrets) {
    try {
      const payload = jwt.verify(token, secret) as JwtPayload;
      req.user = payload;
      next();
      return;
    } catch {
      // try next secret
    }
  }
  res.status(401).json({ success: false, message: 'Invalid or expired token', error: 'TOKEN_INVALID' });
};
