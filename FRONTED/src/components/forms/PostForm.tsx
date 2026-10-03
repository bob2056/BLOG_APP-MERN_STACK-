'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Post, Category, PostStatus } from '@/types';
import { categoryService } from '@/services/category.service';
import { postService, CreatePostDto } from '@/services/post.service';
import { getMediaUrl } from '@/lib/utils';
import { CustomApiError } from '@/lib/api';
import { Upload, X, AlertCircle, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface PostFormProps {
  initialData?: Post;
  isEditing?: boolean;
}

export default function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [excerpt, setExcerpt] = useState<string>(initialData?.excerpt || '');
  const [content, setContent] = useState<string>(initialData?.content || '');
  const [category, setCategory] = useState<string>(initialData?.category?._id || '');
  const [tagsInput, setTagsInput] = useState<string>(initialData?.tags?.join(', ') || '');
  const [status, setStatus] = useState<PostStatus>(initialData?.status || 'DRAFT');

  // Cover image states
  const [coverImageUrl, setCoverImageUrl] = useState<string>(initialData?.coverImage || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load available categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (!category && res.data.length > 0) {
            setCategory(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, [category]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setServerError('Image size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setServerError(null);

    try {
      const res = await postService.uploadCover(file);
      if (res.success && res.data) {
        setCoverImageUrl(res.data.coverImageUrl);
      }
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setServerError(err.message);
      } else {
        setServerError('Failed to upload cover image.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) {
      setServerError('Title, content, and category are required.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const postPayload: CreatePostDto = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      coverImage: coverImageUrl,
      tags: parsedTags,
      status,
    };

    try {
      if (isEditing && initialData) {
        const res = await postService.updatePost(initialData._id, postPayload);
        if (res.success) {
          router.push('/dashboard/posts');
        }
      } else {
        const res = await postService.createPost(postPayload);
        if (res.success) {
          router.push('/dashboard/posts');
        }
      }
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred while saving the post.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel & Return</span>
        </button>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="DRAFT">Save as Draft</option>
            <option value="PUBLISHED">Publish Article</option>
            <option value="ARCHIVED">Archive Article</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Cover Image Upload Area */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Cover Image
        </label>
        {coverImageUrl ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMediaUrl(coverImageUrl)}
              alt="Post cover preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setCoverImageUrl('')}
              className="absolute right-3 top-3 rounded-full bg-slate-900/80 p-2 text-white hover:bg-rose-600 backdrop-blur-sm transition-colors"
              title="Remove cover image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex aspect-[21/7] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <Upload className="mb-2 h-7 w-7 text-indigo-500" />
              <p className="text-xs font-semibold text-slate-700">
                {isUploading ? 'Uploading cover image...' : 'Click to upload post cover image'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP, or GIF (max 5MB)</p>
            </div>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleImageFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Post Title */}
      <div>
        <input
          type="text"
          required
          placeholder="Article Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-none bg-transparent text-2xl sm:text-4xl font-extrabold text-slate-900 placeholder-slate-300 focus:outline-none"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Brief Summary / Excerpt
        </label>
        <textarea
          rows={2}
          placeholder="A compelling overview of this article to entice readers on the homepage..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Category and Tags row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Category *
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="nodejs, typescript, api, react"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-600">
            Article Content *
          </label>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            Markdown & formatted text supported
          </span>
        </div>
        <textarea
          rows={14}
          required
          placeholder="Write your article content here in markdown or plain text..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-serif text-base text-slate-800 leading-relaxed placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
        />
      </div>
    </form>
  );
}
