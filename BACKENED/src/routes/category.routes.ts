import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadCategoryImage } from '../middlewares/upload.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);

// Admin-only routes
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(createCategorySchema, 'body'),
  CategoryController.createCategory
);

router.post(
  '/upload-image',
  requireAuth,
  requireAdmin,
  uploadCategoryImage,
  CategoryController.uploadImage
);

router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(updateCategorySchema, 'body'),
  CategoryController.updateCategory
);

router.delete('/:id', requireAuth, requireAdmin, CategoryController.deleteCategory);

export default router;
