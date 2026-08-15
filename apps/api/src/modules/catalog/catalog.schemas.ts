import { z } from 'zod';

export const movieSearchSchema = z.object({
  query: z.string().trim().min(1).max(100),
});

export type MovieSearchInput = z.infer<typeof movieSearchSchema>;