import mongoose from 'mongoose';
import { Like } from '../models/Like';
import { Post } from '../models/Post';
import { AppError } from '../utils/appError';

export interface LikeResponse {
  likeCount: number;
  isLiked: boolean;
}

export class LikeService {
  static async likePost(postId: string, userId: string): Promise<LikeResponse> {
    const post = await Post.findById(postId).lean();
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    // Try to create like, or ignore if already liked (idempotent / compound unique index safe)
    try {
      await Like.create({
        post: new mongoose.Types.ObjectId(postId),
        user: new mongoose.Types.ObjectId(userId),
      });
    } catch (err: unknown) {
      if ((err as Record<string, unknown>).code === 11000) {
        // Already liked, ignore duplicate
      } else {
        throw err;
      }
    }

    const likeCount = await Like.countDocuments({ post: postId });

    return {
      likeCount,
      isLiked: true,
    };
  }

  static async unlikePost(postId: string, userId: string): Promise<LikeResponse> {
    const post = await Post.findById(postId).lean();
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    await Like.findOneAndDelete({
      post: new mongoose.Types.ObjectId(postId),
      user: new mongoose.Types.ObjectId(userId),
    });

    const likeCount = await Like.countDocuments({ post: postId });

    return {
      likeCount,
      isLiked: false,
    };
  }

  static async getPostLikes(postId: string, currentUserId?: string): Promise<LikeResponse> {
    const post = await Post.findById(postId).lean();
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    const [likeCount, userLike] = await Promise.all([
      Like.countDocuments({ post: postId }),
      currentUserId
        ? Like.findOne({
            post: new mongoose.Types.ObjectId(postId),
            user: new mongoose.Types.ObjectId(currentUserId),
          }).lean()
        : null,
    ]);

    return {
      likeCount,
      isLiked: !!userLike,
    };
  }
}
