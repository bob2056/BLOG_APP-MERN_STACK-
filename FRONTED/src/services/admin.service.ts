import { apiClient } from '@/lib/api';
import { User, Post, Comment, ApiResponse } from '@/types';

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface AdminPostsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  author?: string;
  category?: string;
  search?: string;
}

export interface AdminCommentsQueryParams {
  page?: number;
  limit?: number;
  postId?: string;
}

export const adminService = {
  async getUsers(params?: AdminUsersQueryParams): Promise<ApiResponse<User[]>> {
    return apiClient<User[]>('/admin/users', {
      method: 'GET',
      params: params ? {
        page: params.page,
        limit: params.limit,
        search: params.search,
        role: params.role,
        isActive: params.isActive,
      } : undefined,
    });
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return apiClient<User>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { isActive },
    });
  },

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return apiClient<null>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getPosts(params?: AdminPostsQueryParams): Promise<ApiResponse<Post[]>> {
    return apiClient<Post[]>('/admin/posts', {
      method: 'GET',
      params: params ? {
        page: params.page,
        limit: params.limit,
        status: params.status,
        author: params.author,
        category: params.category,
        search: params.search,
      } : undefined,
    });
  },

  async deletePost(id: string): Promise<ApiResponse<null>> {
    return apiClient<null>(`/admin/posts/${id}`, {
      method: 'DELETE',
    });
  },

  async getComments(params?: AdminCommentsQueryParams): Promise<ApiResponse<Comment[]>> {
    return apiClient<Comment[]>('/admin/comments', {
      method: 'GET',
      params: params ? {
        page: params.page,
        limit: params.limit,
        postId: params.postId,
      } : undefined,
    });
  },

  async deleteComment(id: string): Promise<ApiResponse<null>> {
    return apiClient<null>(`/admin/comments/${id}`, {
      method: 'DELETE',
    });
  },
};
