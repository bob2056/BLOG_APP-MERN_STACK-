import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema, 'body'), AuthController.register);
router.post('/login', validate(loginSchema, 'body'), AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', requireAuth, AuthController.getMe);
router.patch(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema, 'body'),
  AuthController.changePassword
);

export default router;
