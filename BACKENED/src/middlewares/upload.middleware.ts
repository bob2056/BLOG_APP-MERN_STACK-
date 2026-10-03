import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

// Base uploads directory
const BASE_UPLOAD_DIR = path.resolve(process.cwd(), env.UPLOAD_DIR);

// Ensure base and subdirectories exist
const SUBDIRS = ['avatars', 'posts', 'categories'] as const;
type UploadCategory = (typeof SUBDIRS)[number];

fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
for (const sub of SUBDIRS) {
  fs.mkdirSync(path.join(BASE_UPLOAD_DIR, sub), { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const createStorage = (subfolder: UploadCategory) => {
  return multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      const destPath = path.join(BASE_UPLOAD_DIR, subfolder);
      cb(null, destPath);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      // Generate secure unique filename
      const randomHex = crypto.randomBytes(12).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      const sanitizedName = `${Date.now()}-${randomHex}${ext}`;
      cb(null, sanitizedName);
    },
  });
};

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Guard against executable or double extensions (e.g., .php.jpg)
  const dotCount = (file.originalname.match(/\./g) || []).length;
  if (dotCount > 2) {
    return cb(new AppError('Suspicious file format detected: multiple file extensions are prohibited.', 400));
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new AppError(
        'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.',
        400
      )
    );
  }

  cb(null, true);
};

const maxFileSize = env.MAX_FILE_SIZE_MB * 1024 * 1024; // MB to Bytes

export const uploadAvatar = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: maxFileSize },
  fileFilter,
}).single('avatar');

export const uploadCover = multer({
  storage: createStorage('posts'),
  limits: { fileSize: maxFileSize },
  fileFilter,
}).single('coverImage');

export const uploadCategoryImage = multer({
  storage: createStorage('categories'),
  limits: { fileSize: maxFileSize },
  fileFilter,
}).single('image');

// Helper to convert filename to public relative URL path
export const getFileUrl = (subfolder: UploadCategory, filename: string): string => {
  return `/uploads/${subfolder}/${filename}`;
};
