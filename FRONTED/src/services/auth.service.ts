import { apiClient } from '@/lib/api';
import { User, ApiResponse } from '@/types';

export interface RegisterDto {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export const authService = {
  async register(data: RegisterDto): Promise<ApiResponse<AuthResponseData>> {
    return apiClient<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  async login(data: LoginDto): Promise<ApiResponse<AuthResponseData>> {
    return apiClient<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  async getMe(): Promise<ApiResponse<User>> {
    return apiClient<User>('/auth/me', {
      method: 'GET',
    });
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient<null>('/auth/logout', {
      method: 'POST',
    });
  },

  async changePassword(data: ChangePasswordDto): Promise<ApiResponse<null>> {
    return apiClient<null>('/auth/change-password', {
      method: 'PATCH',
      body: data,
    });
  },
};
