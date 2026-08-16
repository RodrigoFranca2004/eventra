import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization.middleware.js';
import { validateTicketSchema } from './gatekeeper.schemas.js';
import { validateTicket } from './gatekeeper.service.js';

export const gatekeeperRouter = Router();

gatekeeperRouter.post(
  '/validate',
  authenticate,
  authorize('GATEKEEPER'),
  async (req, res, next) => {
    try {
      const result = validateTicketSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          message: 'Invalid request data',
          errors: result.error.issues,
        });
        return;
      }

      const validation = await validateTicket(
        result.data.code,
        result.data.eventId,
      );

      if (!validation.valid) {
        const messages = {
          INVALID: 'Invalid ticket',
          ALREADY_USED: 'Ticket already used',
          WRONG_EVENT: 'Ticket belongs to another event',
        };

        res.status(400).json({
          valid: false,
          message: messages[validation.reason],
          reason: validation.reason,
        });
        return;
      }

      res.status(200).json({
        valid: true,
        message: 'Ticket validated successfully',
        data: validation.ticket,
      });
    } catch (error) {
      next(error);
    }
  },
);