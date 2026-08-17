import { z } from 'zod';

export const createReservationSchema = z.object({
  eventId: z.string().uuid(),
  seatIds: z.array(z.string().uuid()).min(1),
});