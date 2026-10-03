import { Types } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AuthUser {
  id: string;
  _id: Types.ObjectId | string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string | string[]> | unknown;
  stack?: string;
}
