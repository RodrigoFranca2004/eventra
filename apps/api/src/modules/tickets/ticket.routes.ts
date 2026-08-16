import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization.middleware.js';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import {
  getUserTicket,
  listUserTickets,
} from './ticket.service.js';

export const ticketRouter = Router();

ticketRouter.get(
  '/',
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

      const tickets = await listUserTickets(
        authenticatedRequest.user.id,
      );

      res.status(200).json({
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  },
);

ticketRouter.get(
  '/:id',
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

      const ticketId = req.params.id;

      if (Array.isArray(ticketId)) {
        res.status(400).json({
          message: 'Invalid ticket ID',
        });
        return;
      }

      const ticket = await getUserTicket(
        ticketId,
        authenticatedRequest.user.id,
      );

      if (!ticket) {
        res.status(404).json({
          message: 'Ticket not found',
        });
        return;
      }

      res.status(200).json({
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  },
);