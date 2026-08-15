import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization.middleware.js';
import { createEvent } from './event.service.js';
import { createEventSchema } from './event.schemas.js';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';

export const eventRouter = Router();

eventRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const result = createEventSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          message: 'Invalid request data',
          errors: result.error.issues,
        });
        return;
      }

      const event = await createEvent(req.user!.id, result.data);

      res.status(201).json({
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },
);