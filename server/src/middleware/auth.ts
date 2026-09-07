import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'pulsera_jwt_secret_dev_key_123';

  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = decoded as AuthUser;
    next();
  });
};
