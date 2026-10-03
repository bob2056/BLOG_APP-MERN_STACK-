import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';
import { AppError } from '../utils/appError';

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token is missing. Please provide a Bearer token.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Malformed authorization header.');
    }

    const payload = verifyToken(token);

    // Verify user still exists in database and is active
    const user = await User.findById(payload.userId).select('+isActive').lean();

    if (!user) {
      throw AppError.unauthorized('User associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated. Please contact support.');
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(AppError.unauthorized('Authentication required.'));
    return;
  }

  if (req.user.role !== 'ADMIN') {
    next(AppError.forbidden('Forbidden: Administrator privileges required for this action.'));
    return;
  }

  next();
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const payload = verifyToken(token);
          const user = await User.findById(payload.userId).select('+isActive').lean();
          if (user && user.isActive) {
            req.user = {
              id: user._id.toString(),
              _id: user._id,
              email: user.email,
              username: user.username,
              role: user.role,
              isActive: user.isActive,
            };
          }
        } catch {
          // Token invalid/expired: ignore and proceed as guest
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
