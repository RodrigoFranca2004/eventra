import { UserRole } from '@prisma/client';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './auth.middleware.js';

export function authorize(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication token is required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
}