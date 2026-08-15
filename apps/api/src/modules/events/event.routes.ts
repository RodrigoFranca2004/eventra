import { Router, Request } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization.middleware.js';
import {
  createEvent,
  cancelEvent,
  getPublishedEventById,
  listEvents,
  publishEvent,
} from './event.service.js';
import { createEventSchema, listEventsSchema } from './event.schemas.js';

import type { AuthenticatedRequest } from '../auth/auth.middleware.js';

export const eventRouter = Router();

type EventParams = {
  id: string;
};

type AuthenticatedEventRequest = AuthenticatedRequest & Request<EventParams>;

eventRouter.get('/', async (req, res, next) => {
  try {
    const result = listEventsSchema.safeParse({
      type: req.query.type,
      search: req.query.search,
    });

    if (!result.success) {
      res.status(400).json({
        message: 'Invalid request data',
        errors: result.error.issues,
      });
      return;
    }

    const events = await listEvents(result.data);

    res.status(200).json({
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

eventRouter.get('/:id', async (req, res, next) => {
  try {
    const event = await getPublishedEventById(req.params.id);

    if (!event) {
      res.status(404).json({
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

eventRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedEventRequest, res, next) => {
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

eventRouter.post(
  '/:id/publish',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedEventRequest, res, next) => {
    try {
      const result = await publishEvent(req.params.id, req.user!.id);

      if (result === null) {
        res.status(404).json({
          message: 'Event not found',
        });
        return;
      }

      if (result === 'FORBIDDEN') {
        res.status(403).json({
          message: 'You do not have permission to publish this event',
        });
        return;
      }

      if (result === 'INVALID_STATUS') {
        res.status(400).json({
          message: 'Only draft events can be published',
        });
        return;
      }

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

eventRouter.post(
  '/:id/cancel',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedEventRequest, res, next) => {
    try {
      const result = await cancelEvent(req.params.id, req.user!.id);

      if (result === null) {
        res.status(404).json({
          message: 'Event not found',
        });
        return;
      }

      if (result === 'FORBIDDEN') {
        res.status(403).json({
          message: 'You do not have permission to cancel this event',
        });
        return;
      }

      if (result === 'INVALID_STATUS') {
        res.status(400).json({
          message: 'Event is already cancelled',
        });
        return;
      }

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

