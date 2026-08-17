import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization.middleware.js';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { createReservationSchema } from './reservation.schemas.js';
import { createReservation, getReservationById } from './reservation.service.js';

export const reservationRouter = Router();

reservationRouter.get(
  '/:reservationId',
  authenticate,
  authorize('CUSTOMER'),
  async (req, res, next) => {
    try {
      const authenticatedRequest = req as AuthenticatedRequest;

      if (!authenticatedRequest.user) {
        res.status(401).json({
          message: 'Authentication required',
        });
        return;
      }

      const reservationId = req.params.reservationId;

      if (Array.isArray(reservationId)) {
        res.status(400).json({
          message: 'Invalid reservation ID',
        });
        return;
      }

      const reservation = await getReservationById(
        reservationId,
        authenticatedRequest.user.id,
      );

      if (!reservation) {
        res.status(404).json({
          message: 'Reservation not found',
        });
        return;
      }

      res.status(200).json({
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  },
);

reservationRouter.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  async (req, res, next) => {
    try {
      const result = createReservationSchema.safeParse(req.body);

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

      const reservation = await createReservation(
        authenticatedRequest.user.id,
        result.data.eventId,
        result.data.seatIds,
      );

      if (reservation === null) {
        res.status(404).json({
          message: 'Event or seats not found',
        });
        return;
      }

      if ('conflict' in reservation && reservation.conflict) {
        res.status(409).json({
          message: 'One or more seats are already occupied',
          seatIds: reservation.seatIds,
        });
        return;
      }

      res.status(201).json({
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  },
);