import { apiClient } from '@/lib/api';
import { Post, ApiResponse } from '@/types';

export const searchService = {
  async searchPosts(q: string, page = 1, limit = 10): Promise<ApiResponse<Post[]>> {
    return apiClient<Post[]>('/search/posts', {
      method: 'GET',
      params: { q, page, limit },
    });
  },
};
