import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { env } from '../config/env';
import multer from 'multer';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const errorMiddleware = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Record<string, string | string[]> | unknown = undefined;

  // 1. Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // 2. Multer upload errors
  else if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File too large. Maximum file size allowed is ${env.MAX_FILE_SIZE_MB}MB.`;
    } else {
      message = `File upload error: ${err.message}`;
    }
  }
  // 3. Mongoose CastError (e.g. invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: '${err.value}' is not a valid format.`;
    errors = { [err.path]: message };
  }
  // 4. Mongoose ValidationError
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed on database constraints.';
    const validationMap: Record<string, string> = {};
    for (const key of Object.keys(err.errors)) {
      validationMap[key] = err.errors[key].message;
    }
    errors = validationMap;
  }
  // 5. MongoDB Duplicate Key Error (E11000)
  else if ((err as unknown as Record<string, unknown>).code === 11000) {
    statusCode = 409;
    const keyValue = (err as unknown as Record<string, unknown>).keyValue as Record<string, unknown> | undefined;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    const value = keyValue ? keyValue[field] : '';
    message = `Duplicate entry: '${value}' is already taken for field '${field}'.`;
    errors = { [field]: `${field} already exists` };
  }
  // 6. JWT Errors
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid authentication token. Authorization denied.';
  } else {
    // Unexpected or generic errors
    statusCode = 500;
    message = err.message || 'Something went wrong on the server.';
  }

  // Response structure adheres strictly to the required specification
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
