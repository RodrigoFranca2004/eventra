import { z } from 'zod';

export const processPaymentSchema = z.object({
  approved: z.boolean(),
});