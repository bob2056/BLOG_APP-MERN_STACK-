import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service';
import { LikeService } from '../services/like.service';
import { BookmarkService } from '../services/bookmark.service';
import { sendCreated, sendSuccess, sendPaginated } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { getFileUrl } from '../middlewares/upload.middleware';
import { getParam } from '../utils/request';

export class PostController {
  static async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await PostService.createPost(req.user!.id, req.body);
      sendCreated(res, post, 'Post created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async uploadCover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw AppError.badRequest('Please upload a cover image file.');
      }

      const coverImageUrl = getFileUrl('posts', req.file.filename);
      sendSuccess(res, { coverImageUrl }, 'Cover image uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PostService.getPosts(req.query as never);
      sendPaginated(res, result.posts, result.pagination, 'Posts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PostService.getPostBySlug(getParam(req, 'slug'), req.user?.id);
      sendSuccess(res, result, 'Post retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMyPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string | undefined;

      const result = await PostService.getMyPosts(req.user!.id, { page, limit, status });
      sendPaginated(res, result.posts, result.pagination, 'Author posts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await PostService.updatePost(
        getParam(req, 'id'),
        req.user!.id,
        req.user!.role,
        req.body
      );
      sendSuccess(res, updated, 'Post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await PostService.deletePost(getParam(req, 'id'), req.user!.id, req.user!.role);
      sendSuccess(res, null, 'Post deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await LikeService.likePost(getParam(req, 'postId'), req.user!.id);
      sendSuccess(res, result, 'Post liked');
    } catch (error) {
      next(error);
    }
  }

  static async unlikePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await LikeService.unlikePost(getParam(req, 'postId'), req.user!.id);
      sendSuccess(res, result, 'Post unliked');
    } catch (error) {
      next(error);
    }
  }

  static async getPostLikes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await LikeService.getPostLikes(getParam(req, 'postId'), req.user?.id);
      sendSuccess(res, result, 'Post likes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async bookmarkPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookmarkService.bookmarkPost(getParam(req, 'postId'), req.user!.id);
      sendSuccess(res, result, 'Post bookmarked');
    } catch (error) {
      next(error);
    }
  }

  static async unbookmarkPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookmarkService.unbookmarkPost(getParam(req, 'postId'), req.user!.id);
      sendSuccess(res, result, 'Post removed from bookmarks');
    } catch (error) {
      next(error);
    }
  }
}
