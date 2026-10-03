import { Category, ICategory } from '../models/Category';
import { Post } from '../models/Post';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';
import { generateUniqueSlug } from '../utils/slugify';
import { AppError } from '../utils/appError';

export interface CategoryWithStats extends ICategory {
  postsCount: number;
}

export class CategoryService {
  static async createCategory(input: CreateCategoryInput): Promise<ICategory> {
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${input.name.trim()}$`, 'i') } }).lean();
    if (existing) {
      throw AppError.conflict(`Category '${input.name}' already exists.`, {
        name: 'Category name already exists',
      });
    }

    const slug = await generateUniqueSlug(Category, input.name);

    return Category.create({
      name: input.name.trim(),
      slug,
      description: input.description || '',
      image: input.image || '',
    });
  }

  static async getAllCategories(): Promise<CategoryWithStats[]> {
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Aggregate published posts count per category
    const stats = await Post.aggregate<{ _id: string; count: number }>([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const stat of stats) {
      countMap.set(stat._id.toString(), stat.count);
    }

    return categories.map((cat) => ({
      ...cat,
      postsCount: countMap.get(cat._id.toString()) || 0,
    })) as unknown as CategoryWithStats[];
  }

  static async getCategoryBySlug(slug: string): Promise<ICategory> {
    const category = await Category.findOne({ slug: slug.toLowerCase() }).lean();
    if (!category) {
      throw AppError.notFound(`Category '${slug}' not found.`);
    }
    return category as unknown as ICategory;
  }

  static async updateCategory(id: string, input: UpdateCategoryInput): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found.');
    }

    if (input.name && input.name.trim() !== category.name) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${input.name.trim()}$`, 'i') },
        _id: { $ne: id },
      }).lean();

      if (existing) {
        throw AppError.conflict(`Category name '${input.name}' is already taken.`, {
          name: 'Category name already in use',
        });
      }

      category.name = input.name.trim();
      category.slug = await generateUniqueSlug(Category, input.name.trim(), id);
    }

    if (input.description !== undefined) category.description = input.description;
    if (input.image !== undefined) category.image = input.image;

    await category.save();
    return category;
  }

  static async deleteCategory(id: string): Promise<void> {
    const category = await Category.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found.');
    }

    // Check if any posts are linked to this category
    const postCount = await Post.countDocuments({ category: id });
    if (postCount > 0) {
      throw AppError.badRequest(
        `Cannot delete category '${category.name}' because it contains ${postCount} post(s). Please reassign or delete them first.`
      );
    }

    await Category.findByIdAndDelete(id);
  }
}
