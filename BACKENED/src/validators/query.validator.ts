import { z } from 'zod';
import mongoose from 'mongoose';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query cannot be empty'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const objectIdParamSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ID format',
  }),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
