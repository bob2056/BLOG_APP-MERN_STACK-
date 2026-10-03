import { Post, IPost } from '../models/Post';
import { PaginationMeta } from '../types';

export interface SearchResult {
  posts: IPost[];
  pagination: PaginationMeta;
}

export class SearchService {
  static async searchPosts(
    queryText: string,
    options: { page?: number; limit?: number }
  ): Promise<SearchResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const term = queryText.trim();

    // Multilingual & flexible case-insensitive search across title, excerpt, content, and tags
    const filter = {
      status: 'PUBLISHED',
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { excerpt: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(`^${term}$`, 'i')] } },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ views: -1, createdAt: -1 })
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
}
