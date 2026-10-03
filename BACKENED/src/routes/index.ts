import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import categoryRoutes from './category.routes';
import commentRoutes from './comment.routes';
import searchRoutes from './search.routes';
import adminRoutes from './admin.routes';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'blog-app-backend',
    },
    'Server is healthy'
  );
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);
router.use('/comments', commentRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

export default router;
