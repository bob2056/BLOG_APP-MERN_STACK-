import mongoose, { FilterQuery } from 'mongoose';
import { User, IUser } from '../models/User';
import { Post, IPost } from '../models/Post';
import { Comment, IComment } from '../models/Comment';
import { Like } from '../models/Like';
import { Bookmark } from '../models/Bookmark';
import { Follow } from '../models/Follow';
import { AppError } from '../utils/appError';
import { PaginationMeta } from '../types';

export interface AdminUsersResult {
  users: Array<Partial<IUser>>;
  pagination: PaginationMeta;
}

export interface AdminPostsResult {
  posts: IPost[];
  pagination: PaginationMeta;
}

export interface AdminCommentsResult {
  comments: IComment[];
  pagination: PaginationMeta;
}

export class AdminService {
  static async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<AdminUsersResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IUser> = {};

    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { username: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    if (options.role) {
      filter.role = options.role.toUpperCase();
    }

    if (options.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: users as unknown as Array<Partial<IUser>>,
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

  static async updateUserStatus(userId: string, isActive: boolean, actingAdminId: string): Promise<IUser> {
    if (userId === actingAdminId && !isActive) {
      throw AppError.badRequest('You cannot deactivate your own administrator account.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    user.isActive = isActive;
    await user.save();
    return user;
  }

  static async deleteUser(userId: string, actingAdminId: string): Promise<void> {
    if (userId === actingAdminId) {
      throw AppError.badRequest('You cannot delete your own administrator account.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    // Cascade cleanup
    await Promise.all([
      User.findByIdAndDelete(userId),
      Post.deleteMany({ author: userObjId }),
      Comment.deleteMany({ author: userObjId }),
      Like.deleteMany({ user: userObjId }),
      Bookmark.deleteMany({ user: userObjId }),
      Follow.deleteMany({ $or: [{ follower: userObjId }, { following: userObjId }] }),
    ]);
  }

  static async getAllPosts(options: {
    page?: number;
    limit?: number;
    status?: string;
    author?: string;
    category?: string;
    search?: string;
  }): Promise<AdminPostsResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPost> = {};

    if (options.status) {
      filter.status = options.status.toUpperCase();
    }

    if (options.author && mongoose.Types.ObjectId.isValid(options.author)) {
      filter.author = new mongoose.Types.ObjectId(options.author);
    }

    if (options.category && mongoose.Types.ObjectId.isValid(options.category)) {
      filter.category = new mongoose.Types.ObjectId(options.category);
    }

    if (options.search && options.search.trim()) {
      filter.title = { $regex: options.search.trim(), $options: 'i' };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username avatar')
        .populate('category', 'name slug')
        .lean(),
      Post.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      posts: posts as unknown as IPost[],
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

  static async deletePost(postId: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    await Promise.all([
      Post.findByIdAndDelete(postId),
      Comment.deleteMany({ post: postId }),
      Like.deleteMany({ post: postId }),
      Bookmark.deleteMany({ post: postId }),
    ]);
  }

  static async getAllComments(options: {
    page?: number;
    limit?: number;
    postId?: string;
  }): Promise<AdminCommentsResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IComment> = {};
    if (options.postId && mongoose.Types.ObjectId.isValid(options.postId)) {
      filter.post = new mongoose.Types.ObjectId(options.postId);
    }

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username avatar')
        .populate('post', 'title slug')
        .lean(),
      Comment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      comments: comments as unknown as IComment[],
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

  static async deleteComment(commentId: string): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw AppError.notFound('Comment not found.');
    }

    await Promise.all([
      Comment.findByIdAndDelete(commentId),
      Comment.deleteMany({ parentComment: commentId }),
    ]);
  }
}
