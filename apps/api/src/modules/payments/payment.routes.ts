import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization.middleware.js';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { processPaymentSchema } from './payment.schemas.js';
import { processPayment } from './payment.service.js';

export const paymentRouter = Router();

paymentRouter.post(
  '/:reservationId',
  authenticate,
  authorize('CUSTOMER'),
  async (req, res, next) => {
    try {
      const result = processPaymentSchema.safeParse(req.body);

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

      const reservationId = req.params.reservationId;

      if (Array.isArray(reservationId)) {
        res.status(400).json({
          message: 'Invalid reservation ID',
        });
        return;
      }

      const payment = await processPayment(
        reservationId,
        authenticatedRequest.user.id,
        result.data.approved,
      );

      if (!payment) {
        res.status(404).json({
          message: 'Reservation not found',
        });
        return;
      }

      res.status(200).json({
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },
);