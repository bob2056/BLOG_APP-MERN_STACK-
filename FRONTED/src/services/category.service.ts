import { apiClient } from '@/lib/api';
import { Category, ApiResponse } from '@/types';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
}

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient<Category[]>('/categories', {
      method: 'GET',
    });
  },

  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return apiClient<Category>(`/categories/${slug}`, {
      method: 'GET',
    });
  },

  async createCategory(data: CreateCategoryDto): Promise<ApiResponse<Category>> {
    return apiClient<Category>('/categories', {
      method: 'POST',
      body: data,
    });
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    return apiClient<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return apiClient<null>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient<{ imageUrl: string }>('/categories/upload-image', {
      method: 'POST',
      body: formData,
    });
  },
};
