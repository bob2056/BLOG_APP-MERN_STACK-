import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/appError';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (schema: AnyZodObject, source: ValidationSource = 'body') => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      // Assign sanitized and coerced data back to request
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        for (const issue of error.issues) {
          const pathKey = issue.path.join('.') || 'root';
          // Only save the first error for each field for clear presentation
          if (!formattedErrors[pathKey]) {
            formattedErrors[pathKey] = issue.message;
          }
        }
        next(new AppError('Validation failed', 400, formattedErrors));
        return;
      }
      next(error);
    }
  };
};
