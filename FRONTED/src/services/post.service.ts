import { apiClient } from '@/lib/api';
import { Post, PostQueryParams, PostDetailResult, ApiResponse, PostStatus } from '@/types';

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  coverImage?: string;
  tags?: string[] | string;
  status?: PostStatus;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  tags?: string[] | string;
  status?: PostStatus;
}

export const postService = {
  async getPosts(params?: PostQueryParams): Promise<ApiResponse<Post[]>> {
    return apiClient<Post[]>('/posts', {
      method: 'GET',
      params: params ? {
        page: params.page,
        limit: params.limit,
        search: params.search,
        category: params.category,
        tag: params.tag,
        author: params.author,
        sort: params.sort,
      } : undefined,
    });
  },

  async getPostBySlug(slug: string): Promise<ApiResponse<PostDetailResult>> {
    return apiClient<PostDetailResult>(`/posts/${slug}`, {
      method: 'GET',
    });
  },

  async getMyPosts(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<Post[]>> {
    return apiClient<Post[]>('/posts/my-posts', {
      method: 'GET',
      params,
    });
  },

  async createPost(data: CreatePostDto): Promise<ApiResponse<Post>> {
    return apiClient<Post>('/posts', {
      method: 'POST',
      body: data,
    });
  },

  async updatePost(id: string, data: UpdatePostDto): Promise<ApiResponse<Post>> {
    return apiClient<Post>(`/posts/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  async deletePost(id: string): Promise<ApiResponse<null>> {
    return apiClient<null>(`/posts/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadCover(file: File): Promise<ApiResponse<{ coverImageUrl: string }>> {
    const formData = new FormData();
    formData.append('coverImage', file);

    return apiClient<{ coverImageUrl: string }>('/posts/upload-cover', {
      method: 'POST',
      body: formData,
    });
  },
};
