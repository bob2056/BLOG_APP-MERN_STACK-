import { Model, Document } from 'mongoose';

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces & dashes)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Trim dashes from beginning and end
};

/**
 * Generate a unique slug for a Mongoose model.
 * If slug exists, appends an incrementing counter (e.g., 'my-post-1', 'my-post-2').
 */
export const generateUniqueSlug = async <T extends Document>(
  model: Model<T>,
  sourceText: string,
  excludeId?: string
): Promise<string> => {
  const baseSlug = slugify(sourceText) || 'post';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingDoc = await model.findOne(query).select('_id').lean();
    if (!existingDoc) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
