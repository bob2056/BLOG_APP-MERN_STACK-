import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types';

export const bookmarkService = {
  async bookmarkPost(postId: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    return apiClient<{ isBookmarked: boolean }>(`/posts/${postId}/bookmark`, {
      method: 'POST',
    });
  },

  async unbookmarkPost(postId: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    return apiClient<{ isBookmarked: boolean }>(`/posts/${postId}/bookmark`, {
      method: 'DELETE',
    });
  },
};
