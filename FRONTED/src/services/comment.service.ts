import { apiClient } from '@/lib/api';
import { Comment, ApiResponse } from '@/types';

export interface CreateCommentDto {
  content: string;
  parentComment?: string | null;
}

export interface UpdateCommentDto {
  content: string;
}

export const commentService = {
  async getPostComments(postId: string, page = 1, limit = 20): Promise<ApiResponse<Comment[]>> {
    return apiClient<Comment[]>(`/posts/${postId}/comments`, {
      method: 'GET',
      params: { page, limit },
    });
  },

  async createComment(postId: string, data: CreateCommentDto): Promise<ApiResponse<Comment>> {
    return apiClient<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: data,
    });
  },

  async updateComment(id: string, data: UpdateCommentDto): Promise<ApiResponse<Comment>> {
    return apiClient<Comment>(`/comments/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  async deleteComment(id: string): Promise<ApiResponse<null>> {
    return apiClient<null>(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};
