import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { FollowService } from '../services/follow.service';
import { BookmarkService } from '../services/bookmark.service';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { getFileUrl } from '../middlewares/upload.middleware';
import { getParam } from '../utils/request';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await UserService.getProfileByUsername(getParam(req, 'username'));
      sendSuccess(res, profile, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await UserService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw AppError.badRequest('Please upload an avatar image file.');
      }

      const avatarUrl = getFileUrl('avatars', req.file.filename);
      const updatedUser = await UserService.updateAvatar(req.user!.id, avatarUrl);
      sendSuccess(res, { user: updatedUser, avatarUrl }, 'Avatar updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async followUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FollowService.followUser(req.user!.id, getParam(req, 'userId'));
      sendSuccess(res, result, 'Successfully followed user');
    } catch (error) {
      next(error);
    }
  }

  static async unfollowUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FollowService.unfollowUser(req.user!.id, getParam(req, 'userId'));
      sendSuccess(res, result, 'Successfully unfollowed user');
    } catch (error) {
      next(error);
    }
  }

  static async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FollowService.getFollowers(getParam(req, 'userId'), req.query);
      sendPaginated(res, result.users, result.pagination, 'Followers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FollowService.getFollowing(getParam(req, 'userId'), req.query);
      sendPaginated(res, result.users, result.pagination, 'Following users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMyBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookmarkService.getUserBookmarks(req.user!.id, req.query);
      sendPaginated(res, result.bookmarks, result.pagination, 'Bookmarked posts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
