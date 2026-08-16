import { Router, Request } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization.middleware.js';
import {
  createEvent,
  cancelEvent,
  getPublishedEventById,
  listEvents,
  publishEvent,
  updateEvent,
  deleteEvent,
} from './event.service.js';

import { 
  listEventSeats,
  createEventSeats,
 } from './seat.service.js';

import {
  createEventSchema,
  listEventsSchema,
  updateEventSchema,
  createSeatsSchema
} from './event.schemas.js';

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

eventRouter.put(
  '/:id',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedEventRequest, res, next) => {
    try {
      const validation = updateEventSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          message: 'Invalid request data',
          errors: validation.error.issues,
        });
        return;
      }

      const result = await updateEvent(
        req.params.id,
        req.user!.id,
        validation.data,
      );

      if (result === null) {
        res.status(404).json({
          message: 'Event not found',
        });
        return;
      }

      if (result === 'FORBIDDEN') {
        res.status(403).json({
          message: 'You do not have permission to update this event',
        });
        return;
      }

      if (result === 'INVALID_STATUS') {
        res.status(400).json({
          message: 'Cancelled events cannot be updated',
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

eventRouter.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedEventRequest, res, next) => {
    try {
      const result = await deleteEvent(req.params.id, req.user!.id);

      if (result === null) {
        res.status(404).json({
          message: 'Event not found',
        });
        return;
      }

      if (result === 'FORBIDDEN') {
        res.status(403).json({
          message: 'You do not have permission to delete this event',
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

eventRouter.post(
  '/:id/seats',
  authenticate,
  authorize('ORGANIZER'),
  async (req, res, next) => {
    try {
      const result = createSeatsSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          message: 'Invalid request data',
          errors: result.error.issues,
        });
        return;
      }

      const authenticatedRequest = req as AuthenticatedRequest;

      if (!authenticatedRequest.user) {
        res.status(401).json({
          message: 'Authentication required',
        });
        return;
      }

      const eventId = req.params.id;

      if (Array.isArray(eventId)) {
        res.status(400).json({
          message: 'Invalid event ID',
        });
        return;
      }

      const seats = await createEventSeats(
        eventId,
        authenticatedRequest.user.id,
        result.data.rows,
      );

      if (seats === null) {
        res.status(404).json({
          message: 'Event not found',
        });
        return;
      }

      res.status(201).json({
        data: seats,
      });
    } catch (error) {
      next(error);
    }
  },
);

eventRouter.get('/:id/seats', async (req, res, next) => {
  try {
    const seats = await listEventSeats(req.params.id);

    if (seats === null) {
      res.status(404).json({
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      data: seats,
    });
  } catch (error) {
    next(error);
  }
});

