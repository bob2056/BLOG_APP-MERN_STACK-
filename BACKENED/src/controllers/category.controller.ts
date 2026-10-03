import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { sendCreated, sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { getFileUrl } from '../middlewares/upload.middleware';
import { getParam } from '../utils/request';

export class CategoryController {
  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      sendCreated(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAllCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getAllCategories();
      sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.getCategoryBySlug(getParam(req, 'slug'));
      sendSuccess(res, category, 'Category details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await CategoryService.updateCategory(getParam(req, 'id'), req.body);
      sendSuccess(res, updated, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CategoryService.deleteCategory(getParam(req, 'id'));
      sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw AppError.badRequest('Please upload an image file.');
      }

      const imageUrl = getFileUrl('categories', req.file.filename);
      sendSuccess(res, { imageUrl }, 'Category image uploaded successfully');
    } catch (error) {
      next(error);
    }
  }
}
