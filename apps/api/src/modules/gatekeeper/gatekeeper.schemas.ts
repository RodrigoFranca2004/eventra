import { z } from 'zod';

export const validateTicketSchema = z.object({
  code: z.string().min(1),
  eventId: z.string().uuid(),
});