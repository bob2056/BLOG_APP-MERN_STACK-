'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Comment, PaginationMeta } from '@/types';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import Pagination from '@/components/common/Pagination';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { Trash2, MessageSquare, ExternalLink } from 'lucide-react';

export default function AdminCommentsPage() {
  const { user: currentUser, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getComments({ page, limit: 12 });
      if (res.success && res.data) {
        setComments(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!isAuthLoading && (!currentUser || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    if (currentUser && isAdmin) {
      fetchComments();
    }
  }, [currentUser, isAdmin, isAuthLoading, router, fetchComments]);

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this comment as administrator?')) return;
    try {
      await adminService.deleteComment(id);
      fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminHeader
        title="Comment Moderation"
        subtitle="Review community feedback, discussion threads, and moderate unwanted content."
      />

      {/* Comments List */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : comments.length > 0 ? (
        <>
          <div className="space-y-4">
            {comments.map((c) => {
              // Post object can be populated with title & slug
              const postRef = c.post as unknown as { title?: string; slug?: string; _id?: string };

              return (
                <div
                  key={c._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-indigo-500" />
                      <Link
                        href={`/profile/${c.author?.username}`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600"
                      >
                        {c.author?.name || 'Anonymous User'}
                      </Link>
                      <span className="text-xs text-slate-400">
                        @{c.author?.username} • {formatDate(c.createdAt)}
                      </span>
                    </div>

                    {postRef?.title && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>On:</span>
                        <Link
                          href={`/blog/${postRef.slug}`}
                          className="font-medium text-slate-700 hover:text-indigo-600 truncate max-w-xs flex items-center gap-1"
                        >
                          <span className="truncate">{postRef.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove Comment</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
          title="No comments found"
          description="There are currently no comments to moderate on the platform."
        />
      )}
    </div>
  );
}
