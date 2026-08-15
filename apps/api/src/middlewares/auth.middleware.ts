import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../modules/auth/token.service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'Authentication token is required',
    });
    return;
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}