import mongoose, { FilterQuery } from 'mongoose';
import { Post, IPost } from '../models/Post';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { Like } from '../models/Like';
import { Bookmark } from '../models/Bookmark';
import { Comment } from '../models/Comment';
import { CreatePostInput, UpdatePostInput, PostQueryInput } from '../validators/post.validator';
import { generateUniqueSlug } from '../utils/slugify';
import { AppError } from '../utils/appError';
import { PaginationMeta } from '../types';

export interface PostListResult {
  posts: IPost[];
  pagination: PaginationMeta;
}

export interface PostDetailResult {
  post: IPost;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export class PostService {
  static async createPost(authorId: string, input: CreatePostInput): Promise<IPost> {
    // Validate category exists
    const categoryExists = await Category.findById(input.category).lean();
    if (!categoryExists) {
      throw AppError.badRequest('Selected category does not exist.', {
        category: 'Category not found',
      });
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(Post, input.title);

    const postData: Partial<IPost> = {
      title: input.title,
      slug,
      excerpt: input.excerpt || '',
      content: input.content,
      category: new mongoose.Types.ObjectId(input.category),
      author: new mongoose.Types.ObjectId(authorId),
      coverImage: input.coverImage || '',
      tags: input.tags || [],
      status: input.status || 'DRAFT',
      views: 0,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    };

    const newPost = await Post.create(postData);

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'name username avatar')
      .populate('category', 'name slug');

    return populatedPost!;
  }

  static async getPosts(query: PostQueryInput): Promise<PostListResult> {
    const page = Math.max(1, query.page);
    const limit = Math.min(50, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPost> = { status: 'PUBLISHED' };

    // Search query on title, excerpt, content, or tags
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { excerpt: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(`^${term}$`, 'i')] } },
      ];
    }

    // Category filter (supports either ObjectId or category slug)
    if (query.category && query.category.trim()) {
      const catParam = query.category.trim();
      if (mongoose.Types.ObjectId.isValid(catParam)) {
        filter.category = new mongoose.Types.ObjectId(catParam);
      } else {
        const cat = await Category.findOne({ slug: catParam.toLowerCase() }).lean();
        if (cat) {
          filter.category = cat._id;
        } else {
          // If category slug does not match any category, return empty result
          return {
            posts: [],
            pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
          };
        }
      }
    }

    // Tag filter
    if (query.tag && query.tag.trim()) {
      filter.tags = query.tag.trim().toLowerCase();
    }

    // Author filter (supports either ObjectId or username)
    if (query.author && query.author.trim()) {
      const authorParam = query.author.trim();
      if (mongoose.Types.ObjectId.isValid(authorParam)) {
        filter.author = new mongoose.Types.ObjectId(authorParam);
      } else {
        const user = await User.findOne({ username: authorParam.toLowerCase() }).lean();
        if (user) {
          filter.author = user._id;
        } else {
          return {
            posts: [],
            pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
          };
        }
      }
    }

    // Sorting
    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (query.sort === 'most_viewed' || query.sort === 'most-viewed' || query.sort === 'views') {
      sortQuery = { views: -1, createdAt: -1 };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortQuery)
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

  static async getPostBySlug(slug: string, currentUserId?: string): Promise<PostDetailResult> {
    const post = await Post.findOneAndUpdate(
      { slug: slug.toLowerCase(), status: 'PUBLISHED' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name username avatar bio')
      .populate('category', 'name slug description');

    if (!post) {
      throw AppError.notFound(`Post with slug '${slug}' not found.`);
    }

    // Concurrently fetch like count and user's like/bookmark status
    const [likeCount, userLike, userBookmark] = await Promise.all([
      Like.countDocuments({ post: post._id }),
      currentUserId ? Like.findOne({ post: post._id, user: currentUserId }).lean() : null,
      currentUserId ? Bookmark.findOne({ post: post._id, user: currentUserId }).lean() : null,
    ]);

    return {
      post,
      likeCount,
      isLiked: !!userLike,
      isBookmarked: !!userBookmark,
    };
  }

  static async getMyPosts(
    authorId: string,
    options: { page?: number; limit?: number; status?: string }
  ): Promise<PostListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPost> = { author: new mongoose.Types.ObjectId(authorId) };
    if (options.status) {
      filter.status = options.status.toUpperCase();
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
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

  static async updatePost(
    postId: string,
    userId: string,
    userRole: string,
    input: UpdatePostInput
  ): Promise<IPost> {
    const post = await Post.findById(postId);
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    // Permission check: only author or admin can modify
    if (post.author.toString() !== userId && userRole !== 'ADMIN') {
      throw AppError.forbidden('You do not have permission to modify this post.');
    }

    // Validate category if provided
    if (input.category) {
      const catExists = await Category.findById(input.category).lean();
      if (!catExists) {
        throw AppError.badRequest('Selected category does not exist.');
      }
      post.category = new mongoose.Types.ObjectId(input.category);
    }

    // If title changed, generate new unique slug
    if (input.title && input.title !== post.title) {
      post.title = input.title;
      post.slug = await generateUniqueSlug(Post, input.title, post._id.toString());
    }

    if (input.content !== undefined) post.content = input.content;
    if (input.excerpt !== undefined) post.excerpt = input.excerpt;
    if (input.coverImage !== undefined) post.coverImage = input.coverImage;
    if (input.tags !== undefined) post.tags = input.tags;

    // Handle status transitions and publishedAt
    if (input.status !== undefined) {
      if (input.status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
        post.publishedAt = new Date();
      }
      post.status = input.status;
    }

    await post.save();

    const updated = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('category', 'name slug');

    return updated!;
  }

  static async deletePost(postId: string, userId: string, userRole: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw AppError.notFound('Post not found.');
    }

    // Permission check: only author or admin can delete
    if (post.author.toString() !== userId && userRole !== 'ADMIN') {
      throw AppError.forbidden('You do not have permission to delete this post.');
    }

    // Delete post and cascade delete associated comments, likes, bookmarks
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Comment.deleteMany({ post: postId }),
      Like.deleteMany({ post: postId }),
      Bookmark.deleteMany({ post: postId }),
    ]);
  }
}
