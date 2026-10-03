import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { sendCreated, sendSuccess, sendPaginated } from '../utils/apiResponse';
import { getParam } from '../utils/request';

export class CommentController {
  static async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await CommentService.createComment(
        getParam(req, 'postId'),
        req.user!.id,
        req.body
      );
      sendCreated(res, comment, 'Comment added successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPostComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await CommentService.getPostComments(getParam(req, 'postId'), { page, limit });
      sendPaginated(res, result.comments, result.pagination, 'Comments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await CommentService.updateComment(
        getParam(req, 'id'),
        req.user!.id,
        req.user!.role,
        req.body
      );
      sendSuccess(res, updated, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CommentService.deleteComment(getParam(req, 'id'), req.user!.id, req.user!.role);
      sendSuccess(res, null, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
