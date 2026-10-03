import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  parentComment: objectIdValidator.nullable().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
