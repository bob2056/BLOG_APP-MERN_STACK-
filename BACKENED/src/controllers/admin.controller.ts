import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { getParam } from '../utils/request';

export class AdminController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;
      let isActive: boolean | undefined = undefined;
      if (req.query.isActive !== undefined) {
        isActive = req.query.isActive === 'true';
      }

      const result = await AdminService.getAllUsers({ page, limit, search, role, isActive });
      sendPaginated(res, result.users, result.pagination, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AdminService.updateUserStatus(
        getParam(req, 'id'),
        req.body.isActive,
        req.user!.id
      );
      sendSuccess(res, updated, `User account ${req.body.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AdminService.deleteUser(getParam(req, 'id'), req.user!.id);
      sendSuccess(res, null, 'User and associated data deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string | undefined;
      const author = req.query.author as string | undefined;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await AdminService.getAllPosts({ page, limit, status, author, category, search });
      sendPaginated(res, result.posts, result.pagination, 'Posts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AdminService.deletePost(getParam(req, 'id'));
      sendSuccess(res, null, 'Post deleted successfully by administrator');
    } catch (error) {
      next(error);
    }
  }

  static async getAllComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const postId = req.query.postId as string | undefined;

      const result = await AdminService.getAllComments({ page, limit, postId });
      sendPaginated(res, result.comments, result.pagination, 'Comments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AdminService.deleteComment(getParam(req, 'id'));
      sendSuccess(res, null, 'Comment deleted successfully by administrator');
    } catch (error) {
      next(error);
    }
  }
}
