import { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      res.status(403).json({
        message: 'Access denied',
      });
      return;
    }

    next();
  };
}