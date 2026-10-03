'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { categoryService } from '@/services/category.service';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { CustomApiError } from '@/lib/api';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle, Check, X, Layers } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { user: currentUser, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Form states for creating / editing
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await categoryService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && (!currentUser || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    if (currentUser && isAdmin) {
      fetchCategories();
    }
  }, [currentUser, isAdmin, isAuthLoading, router, fetchCategories]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsEditing(false);
    setEditId(null);
  };

  const handleStartEdit = (cat: Category) => {
    setIsEditing(true);
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isEditing && editId) {
        const res = await categoryService.updateCategory(editId, {
          name: name.trim(),
          description: description.trim(),
        });
        if (res.success) {
          setMessage({ text: 'Category updated successfully!' });
          resetForm();
          fetchCategories();
        }
      } else {
        const res = await categoryService.createCategory({
          name: name.trim(),
          description: description.trim(),
        });
        if (res.success) {
          setMessage({ text: 'Category created successfully!' });
          resetForm();
          fetchCategories();
        }
      }
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setMessage({ text: err.message, error: true });
      } else {
        setMessage({ text: 'Failed to process category request.', error: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category '${catName}'?`)) return;

    setMessage(null);
    try {
      await categoryService.deleteCategory(id);
      setMessage({ text: `Category '${catName}' deleted.` });
      fetchCategories();
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setMessage({ text: err.message, error: true });
      } else {
        setMessage({ text: 'Failed to delete category.', error: true });
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <AdminHeader
        title="Category Taxonomy"
        subtitle="Manage and organize article classification categories across the blog."
      />

      {message && (
        <div
          className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
            message.error
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {message.error ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          ) : (
            <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Create/Edit Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-indigo-600" />
              <span>{isEditing ? 'Edit Category' : 'Create New Category'}</span>
            </h3>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Computing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Explain what topics are covered under this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {isEditing ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}</span>
            </button>
          </form>
        </div>

        {/* Right: Existing Categories Listing */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Available Categories ({categories.length})</span>
            </h3>
          </div>

          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : categories.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 px-4">Name & Slug</th>
                    <th className="py-3 px-4">Articles</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{cat.name}</p>
                        <p className="text-xs text-indigo-600 font-mono">/category/{cat.slug}</p>
                        {cat.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {cat.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                        {cat.postsCount ?? 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No categories"
              description="Create your first category using the form."
            />
          )}
        </div>
      </div>
    </div>
  );
}
