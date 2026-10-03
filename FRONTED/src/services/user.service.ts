import { apiClient } from '@/lib/api';
import { User, UserProfileResponse, Post, ApiResponse } from '@/types';

export interface UpdateProfileDto {
  name?: string;
  username?: string;
  bio?: string;
}

export const userService = {
  async getProfile(username: string): Promise<ApiResponse<UserProfileResponse>> {
    return apiClient<UserProfileResponse>(`/users/${username}`, {
      method: 'GET',
    });
  },

  async updateProfile(data: UpdateProfileDto): Promise<ApiResponse<User>> {
    return apiClient<User>('/users/me', {
      method: 'PATCH',
      body: data,
    });
  },

  async updateAvatar(file: File): Promise<ApiResponse<{ user: User; avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient<{ user: User; avatarUrl: string }>('/users/me/avatar', {
      method: 'PATCH',
      body: formData,
    });
  },

  async getMyBookmarks(page = 1, limit = 10): Promise<ApiResponse<Array<{ _id: string; createdAt: string; post: Post }>>> {
    return apiClient<Array<{ _id: string; createdAt: string; post: Post }>>('/users/me/bookmarks', {
      method: 'GET',
      params: { page, limit },
    });
  },

  async followUser(userId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
    return apiClient<{ isFollowing: boolean }>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  async unfollowUser(userId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
    return apiClient<{ isFollowing: boolean }>(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  },

  async getFollowers(userId: string, page = 1, limit = 10): Promise<ApiResponse<User[]>> {
    return apiClient<User[]>(`/users/${userId}/followers`, {
      method: 'GET',
      params: { page, limit },
    });
  },

  async getFollowing(userId: string, page = 1, limit = 10): Promise<ApiResponse<User[]>> {
    return apiClient<User[]>(`/users/${userId}/following`, {
      method: 'GET',
      params: { page, limit },
    });
  },
};
