import { Response } from 'express';
import { ApiSuccessResponse, PaginationMeta } from '../types';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  options: {
    message?: string;
    data: T;
    pagination?: PaginationMeta;
  }
): Response => {
  const responsePayload: ApiSuccessResponse<T> = {
    success: true,
    ...(options.message ? { message: options.message } : {}),
    data: options.data,
    ...(options.pagination ? { pagination: options.pagination } : {}),
  };

  return res.status(statusCode).json(responsePayload);
};

export const sendSuccess = <T>(res: Response, data: T, message?: string): Response => {
  return sendResponse(res, 200, { data, message });
};

export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  return sendResponse(res, 201, { data, message });
};

export const sendPaginated = <T>(
  res: Response,
  data: T,
  pagination: PaginationMeta,
  message?: string
): Response => {
  return sendResponse(res, 200, { data, pagination, message });
};
