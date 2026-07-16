import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  const user = await AuthService.getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  (req as any).user = user;
  next();
};
