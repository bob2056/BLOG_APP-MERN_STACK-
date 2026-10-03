import mongoose from 'mongoose';
import { Follow } from '../models/Follow';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/appError';
import { PaginationMeta } from '../types';

export interface UserFollowListResult {
  users: Array<Partial<IUser>>;
  pagination: PaginationMeta;
}

export class FollowService {
  static async followUser(
    followerId: string,
    targetUserId: string
  ): Promise<{ isFollowing: boolean }> {
    if (followerId === targetUserId) {
      throw AppError.badRequest('You cannot follow yourself.');
    }

    const targetUser = await User.findById(targetUserId).lean();
    if (!targetUser) {
      throw AppError.notFound('User to follow not found.');
    }

    try {
      await Follow.create({
        follower: new mongoose.Types.ObjectId(followerId),
        following: new mongoose.Types.ObjectId(targetUserId),
      });
    } catch (err: unknown) {
      if ((err as Record<string, unknown>).code === 11000) {
        // Already following
      } else {
        throw err;
      }
    }

    return { isFollowing: true };
  }

  static async unfollowUser(
    followerId: string,
    targetUserId: string
  ): Promise<{ isFollowing: boolean }> {
    await Follow.findOneAndDelete({
      follower: new mongoose.Types.ObjectId(followerId),
      following: new mongoose.Types.ObjectId(targetUserId),
    });

    return { isFollowing: false };
  }

  static async getFollowers(
    userId: string,
    options: { page?: number; limit?: number }
  ): Promise<UserFollowListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const userObjId = new mongoose.Types.ObjectId(userId);

    const [follows, total] = await Promise.all([
      Follow.find({ following: userObjId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('follower', 'name username avatar bio')
        .lean(),
      Follow.countDocuments({ following: userObjId }),
    ]);

    const followers = follows.map((f) => f.follower as unknown as Partial<IUser>);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: followers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getFollowing(
    userId: string,
    options: { page?: number; limit?: number }
  ): Promise<UserFollowListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const userObjId = new mongoose.Types.ObjectId(userId);

    const [follows, total] = await Promise.all([
      Follow.find({ follower: userObjId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('following', 'name username avatar bio')
        .lean(),
      Follow.countDocuments({ follower: userObjId }),
    ]);

    const following = follows.map((f) => f.following as unknown as Partial<IUser>);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: following,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
