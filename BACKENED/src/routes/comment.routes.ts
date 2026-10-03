import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateCommentSchema } from '../validators/comment.validator';

const router = Router();

// Modify comment
router.patch(
  '/:id',
  requireAuth,
  validate(updateCommentSchema, 'body'),
  CommentController.updateComment
);

// Delete comment
router.delete('/:id', requireAuth, CommentController.deleteComment);

export default router;
