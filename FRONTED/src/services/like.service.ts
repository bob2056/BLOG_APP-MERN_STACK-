import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface LikeResponseData {
  likeCount: number;
  isLiked: boolean;
}

export const likeService = {
  async likePost(postId: string): Promise<ApiResponse<LikeResponseData>> {
    return apiClient<LikeResponseData>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  async unlikePost(postId: string): Promise<ApiResponse<LikeResponseData>> {
    return apiClient<LikeResponseData>(`/posts/${postId}/like`, {
      method: 'DELETE',
    });
  },

  async getPostLikes(postId: string): Promise<ApiResponse<LikeResponseData>> {
    return apiClient<LikeResponseData>(`/posts/${postId}/likes`, {
      method: 'GET',
    });
  },
};
