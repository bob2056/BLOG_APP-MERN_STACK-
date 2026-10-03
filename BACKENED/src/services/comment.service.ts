import mongoose from 'mongoose';
import { Comment, IComment } from '../models/Comment';
import { Post } from '../models/Post';
import { CreateCommentInput, UpdateCommentInput } from '../validators/comment.validator';
import { AppError } from '../utils/appError';
import { PaginationMeta } from '../types';

export interface CommentWithReplies {
  _id: unknown;
  content: string;
  author: unknown;
  post: unknown;
  parentComment?: unknown;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: unknown[];
}

export interface CommentListResult {
  comments: CommentWithReplies[];
  pagination: PaginationMeta;
}

export class CommentService {
  static async createComment(
    postId: string,
    authorId: string,
    input: CreateCommentInput
  ): Promise<IComment> {
    const post = await Post.findById(postId).lean();
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    if (post.status !== 'PUBLISHED') {
      throw AppError.badRequest('Comments can only be posted on published articles.');
    }

    let parentCommentId: mongoose.Types.ObjectId | null = null;
    if (input.parentComment) {
      const parent = await Comment.findOne({
        _id: input.parentComment,
        post: postId,
      }).lean();

      if (!parent) {
        throw AppError.badRequest('Parent comment does not exist or does not belong to this post.');
      }
      parentCommentId = new mongoose.Types.ObjectId(input.parentComment);
    }

    const comment = await Comment.create({
      content: input.content.trim(),
      author: new mongoose.Types.ObjectId(authorId),
      post: new mongoose.Types.ObjectId(postId),
      parentComment: parentCommentId,
      isEdited: false,
    });

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name username avatar'
    );

    return populated!;
  }

  static async getPostComments(
    postId: string,
    options: { page?: number; limit?: number }
  ): Promise<CommentListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const postExists = await Post.findById(postId).lean();
    if (!postExists) {
      throw AppError.notFound('Post not found.');
    }

    // Query top-level comments for pagination
    const topLevelFilter = { post: new mongoose.Types.ObjectId(postId), parentComment: null };

    const [topLevelComments, total] = await Promise.all([
      Comment.find(topLevelFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username avatar')
        .lean(),
      Comment.countDocuments(topLevelFilter),
    ]);

    // Fetch replies for these top-level comments
    const topLevelIds = topLevelComments.map((c) => c._id);
    const replies = await Comment.find({
      post: new mongoose.Types.ObjectId(postId),
      parentComment: { $in: topLevelIds },
    })
      .sort({ createdAt: 1 })
      .populate('author', 'name username avatar')
      .lean();

    // Group replies under their respective parent comments
    const replyMap = new Map<string, IComment[]>();
    for (const reply of replies) {
      const parentIdStr = reply.parentComment!.toString();
      if (!replyMap.has(parentIdStr)) {
        replyMap.set(parentIdStr, []);
      }
      replyMap.get(parentIdStr)!.push(reply as unknown as IComment);
    }

    const nestedComments: CommentWithReplies[] = topLevelComments.map((top) => ({
      ...(top as unknown as IComment),
      replies: replyMap.get(top._id.toString()) || [],
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      comments: nestedComments,
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

  static async updateComment(
    commentId: string,
    userId: string,
    userRole: string,
    input: UpdateCommentInput
  ): Promise<IComment> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw AppError.notFound('Comment not found.');
    }

    if (comment.author.toString() !== userId && userRole !== 'ADMIN') {
      throw AppError.forbidden('You do not have permission to modify this comment.');
    }

    comment.content = input.content.trim();
    comment.isEdited = true;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name username avatar'
    );

    return populated!;
  }

  static async deleteComment(commentId: string, userId: string, userRole: string): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw AppError.notFound('Comment not found.');
    }

    if (comment.author.toString() !== userId && userRole !== 'ADMIN') {
      throw AppError.forbidden('You do not have permission to delete this comment.');
    }

    // Delete the comment and any child replies
    await Promise.all([
      Comment.findByIdAndDelete(commentId),
      Comment.deleteMany({ parentComment: commentId }),
    ]);
  }
}
