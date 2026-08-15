import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(['MOVIE', 'SHOW']),
  externalId: z.string().trim().optional(),
  date: z.coerce.date(),
  location: z.string().trim().min(1).max(300),
  capacity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;