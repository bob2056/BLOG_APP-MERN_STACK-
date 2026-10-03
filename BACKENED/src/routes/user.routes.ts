import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadAvatar } from '../middlewares/upload.middleware';
import { updateProfileSchema } from '../validators/user.validator';
import { paginationQuerySchema } from '../validators/query.validator';

const router = Router();

// Current user routes (Must precede :username parameterized route)
router.get('/me/bookmarks', requireAuth, validate(paginationQuerySchema, 'query'), UserController.getMyBookmarks);
router.patch('/me', requireAuth, validate(updateProfileSchema, 'body'), UserController.updateProfile);
router.patch('/me/avatar', requireAuth, uploadAvatar, UserController.updateAvatar);

// Public profile route
router.get('/:username', UserController.getProfile);

// Follow / Unfollow system
router.post('/:userId/follow', requireAuth, UserController.followUser);
router.delete('/:userId/follow', requireAuth, UserController.unfollowUser);
router.get('/:userId/followers', validate(paginationQuerySchema, 'query'), UserController.getFollowers);
router.get('/:userId/following', validate(paginationQuerySchema, 'query'), UserController.getFollowing);

export default router;
