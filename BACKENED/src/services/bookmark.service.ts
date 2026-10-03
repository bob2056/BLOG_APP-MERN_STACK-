import mongoose from 'mongoose';
import { Bookmark } from '../models/Bookmark';
import { Post, IPost } from '../models/Post';
import { AppError } from '../utils/appError';
import { PaginationMeta } from '../types';

export interface BookmarkListResult {
  bookmarks: Array<{
    _id: string;
    createdAt: Date;
    post: IPost;
  }>;
  pagination: PaginationMeta;
}

export class BookmarkService {
  static async bookmarkPost(postId: string, userId: string): Promise<{ isBookmarked: boolean }> {
    const post = await Post.findById(postId).lean();
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    try {
      await Bookmark.create({
        post: new mongoose.Types.ObjectId(postId),
        user: new mongoose.Types.ObjectId(userId),
      });
    } catch (err: unknown) {
      if ((err as Record<string, unknown>).code === 11000) {
        // Already bookmarked, safe idempotent return
      } else {
        throw err;
      }
    }

    return { isBookmarked: true };
  }

  static async unbookmarkPost(postId: string, userId: string): Promise<{ isBookmarked: boolean }> {
    const post = await Post.findById(postId).lean();
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    await Bookmark.findOneAndDelete({
      post: new mongoose.Types.ObjectId(postId),
      user: new mongoose.Types.ObjectId(userId),
    });

    return { isBookmarked: false };
  }

  static async getUserBookmarks(
    userId: string,
    options: { page?: number; limit?: number }
  ): Promise<BookmarkListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const userObjId = new mongoose.Types.ObjectId(userId);

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({ user: userObjId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'post',
          populate: [
            { path: 'author', select: 'name username avatar' },
            { path: 'category', select: 'name slug' },
          ],
        })
        .lean(),
      Bookmark.countDocuments({ user: userObjId }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      bookmarks: bookmarks as unknown as BookmarkListResult['bookmarks'],
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
