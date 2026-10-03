import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CLIENT_URL: string;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE_MB: number;
}

export const env: EnvConfig = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_app_db',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_for_blog_app_2026_dev_mode_123456',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB ? parseInt(process.env.MAX_FILE_SIZE_MB, 10) : 5,
};

// Safety check for required production secrets
if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'super_secret_jwt_key_for_blog_app_2026_dev_mode_123456') {
  console.warn('WARNING: Running in production with default JWT_SECRET! Please configure a secure JWT_SECRET.');
}
