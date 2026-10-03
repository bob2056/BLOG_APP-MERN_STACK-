import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { adminUserStatusSchema } from '../validators/user.validator';

const router = Router();

// Protect all admin routes with authentication and admin role verification
router.use(requireAuth, requireAdmin);

// User administration
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/status', validate(adminUserStatusSchema, 'body'), AdminController.updateUserStatus);
router.delete('/users/:id', AdminController.deleteUser);

// Post moderation
router.get('/posts', AdminController.getAllPosts);
router.delete('/posts/:id', AdminController.deletePost);

// Comment moderation
router.get('/comments', AdminController.getAllComments);
router.delete('/comments/:id', AdminController.deleteComment);

export default router;
