import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { CommentController } from '../controllers/comment.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadCover } from '../middlewares/upload.middleware';
import {
  createPostSchema,
  updatePostSchema,
  postQuerySchema,
} from '../validators/post.validator';
import { createCommentSchema } from '../validators/comment.validator';

const router = Router();

// Post Creation & Uploads
router.post('/', requireAuth, validate(createPostSchema, 'body'), PostController.createPost);
router.post('/upload-cover', requireAuth, uploadCover, PostController.uploadCover);

// Post Listing
router.get('/', validate(postQuerySchema, 'query'), PostController.getPosts);
router.get('/my-posts', requireAuth, PostController.getMyPosts);

// Single Post Read
router.get('/:slug', optionalAuth, PostController.getPostBySlug);

// Post Modifications (Author or Admin)
router.patch('/:id', requireAuth, validate(updatePostSchema, 'body'), PostController.updatePost);
router.delete('/:id', requireAuth, PostController.deletePost);

// Post Likes
router.post('/:postId/like', requireAuth, PostController.likePost);
router.delete('/:postId/like', requireAuth, PostController.unlikePost);
router.get('/:postId/likes', optionalAuth, PostController.getPostLikes);

// Post Bookmarks
router.post('/:postId/bookmark', requireAuth, PostController.bookmarkPost);
router.delete('/:postId/bookmark', requireAuth, PostController.unbookmarkPost);

// Comments for a specific post
router.post(
  '/:postId/comments',
  requireAuth,
  validate(createCommentSchema, 'body'),
  CommentController.createComment
);
router.get('/:postId/comments', CommentController.getPostComments);

export default router;
