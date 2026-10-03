export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string | string[]> | unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string | string[]> | unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors?: Record<string, string | string[]> | unknown): AppError {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404);
  }

  static conflict(message = 'Resource already exists', errors?: Record<string, string | string[]> | unknown): AppError {
    return new AppError(message, 409, errors);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500, undefined, false);
  }
}
