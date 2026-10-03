'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post, PaginationMeta } from '@/types';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import Pagination from '@/components/common/Pagination';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { Search, Trash2, ExternalLink } from 'lucide-react';

export default function AdminPostsPage() {
  const { user: currentUser, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAdminPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getPosts({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });

      if (res.success && res.data) {
        setPosts(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load admin posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (!isAuthLoading && (!currentUser || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    if (currentUser && isAdmin) {
      fetchAdminPosts();
    }
  }, [currentUser, isAdmin, isAuthLoading, router, fetchAdminPosts]);

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post as administrator?')) return;
    try {
      await adminService.deletePost(id);
      fetchAdminPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminHeader
        title="Article Moderation Console"
        subtitle="Review, inspect, and moderate all platform publications across authors."
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search article title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : posts.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {posts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        <Link
                          href={`/blog/${p.slug}`}
                          className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate">{p.title}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <Link
                          href={`/profile/${p.author?.username}`}
                          className="font-medium text-slate-800 hover:text-indigo-600"
                        >
                          {p.author?.name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {p.category?.name || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{p.views || 0}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeletePost(p._id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete article (moderation)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="No articles match criteria"
          description="Try changing status or search term."
        />
      )}
    </div>
  );
}
