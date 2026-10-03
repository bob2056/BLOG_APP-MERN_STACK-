import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, underscores, hyphens, and dots')
    .optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

export const adminUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status boolean is required' }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminUserStatusInput = z.infer<typeof adminUserStatusSchema>;
