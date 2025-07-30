import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden: Insufficient role' });
  }
  next();
}; 