import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from './token.service.js';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'Authentication required',
    });
    return;
  }

  const token = authorization.slice(7);

  try {
    const payload = verifyToken(token);

    req.authUser = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}