import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(10, 'Content must be at least 10 characters'),
  excerpt: z
    .string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .optional()
    .default(''),
  category: objectIdValidator,
  coverImage: z.string().optional().default(''),
  tags: z
    .union([z.array(z.string().trim().toLowerCase()), z.string()])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((t) => t.trim().toLowerCase()).filter(Boolean);
      return val
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  content: z
    .string()
    .trim()
    .min(10, 'Content must be at least 10 characters')
    .optional(),
  excerpt: z
    .string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .optional(),
  category: objectIdValidator.optional(),
  coverImage: z.string().optional(),
  tags: z
    .union([z.array(z.string().trim().toLowerCase()), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val)) return val.map((t) => t.trim().toLowerCase()).filter(Boolean);
      return val
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const postQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'most_viewed', 'most-viewed', 'views']).default('newest'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
