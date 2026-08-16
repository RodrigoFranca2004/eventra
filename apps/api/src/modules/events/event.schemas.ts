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

export const listEventsSchema = z.object({
  type: z.enum(['MOVIE', 'SHOW']).optional(),
  search: z.string().trim().max(100).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  date: z.coerce.date(),
  location: z.string().trim().min(1).max(300),
  capacity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

export const createSeatsSchema = z.object({
  rows: z.array(
    z.object({
      name: z.string().min(1).max(5),
      seats: z.number().int().min(1).max(100),
      type: z.enum(['STANDARD', 'PREMIUM', 'ACCESSIBLE']).default('STANDARD'),
    }),
  ).min(1).max(50),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ListEventsSchema = z.infer<typeof listEventsSchema>;