'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post, PaginationMeta } from '@/types';
import { postService } from '@/services/post.service';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Pagination from '@/components/common/Pagination';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { PenSquare, Trash2, ExternalLink, Globe, FileEdit } from 'lucide-react';

export default function MyPostsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMyPosts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await postService.getMyPosts({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });

      if (res.success && res.data) {
        setPosts(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load my posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, page, statusFilter]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login?redirect=/dashboard/posts');
      return;
    }

    if (user) {
      fetchMyPosts();
    }
  }, [user, isAuthLoading, router, fetchMyPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(id);
      fetchMyPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleStatusToggle = async (post: Post) => {
    const nextStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await postService.updatePost(post._id, { status: nextStatus });
      fetchMyPosts();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <DashboardHeader
        title="My Publications"
        subtitle="Manage, review, publish, and edit all articles authored by your account."
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { label: 'All Articles', value: '' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Drafts', value: 'DRAFT' },
          { label: 'Archived', value: 'ARCHIVED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
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
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-sm truncate">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate">{post.title}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {post.category?.name || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : post.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{post.views || 0}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Publish / Unpublish Toggle */}
                          <button
                            onClick={() => handleStatusToggle(post)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                              post.status === 'PUBLISHED'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={post.status === 'PUBLISHED' ? 'Switch to Draft' : 'Publish Article'}
                          >
                            {post.status === 'PUBLISHED' ? (
                              <span className="flex items-center gap-1">
                                <FileEdit className="h-3 w-3" />
                                <span>Unpublish</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span>Publish</span>
                              </span>
                            )}
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/dashboard/posts/${post._id}/edit`}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Edit post"
                          >
                            <PenSquare className="h-4 w-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete post"
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
          </div>

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="No articles found"
          description={
            statusFilter
              ? `You don't have any articles with status '${statusFilter}'.`
              : "You haven't created any articles yet."
          }
          actionText="Create New Article"
          actionHref="/dashboard/posts/create"
        />
      )}
    </div>
  );
}
