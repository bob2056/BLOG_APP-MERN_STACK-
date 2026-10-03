'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post, PaginationMeta } from '@/types';
import { userService } from '@/services/user.service';
import { bookmarkService } from '@/services/bookmark.service';
import { useAuth } from '@/context/AuthContext';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/common/Pagination';
import { PostGridSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { Bookmark, Trash2 } from 'lucide-react';

export default function BookmarksPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<Array<{ _id: string; createdAt: string; post: Post }>>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBookmarks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await userService.getMyBookmarks(page, 9);
      if (res.success && res.data) {
        setBookmarks(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login?redirect=/bookmarks');
      return;
    }

    if (user) {
      fetchBookmarks();
    }
  }, [user, isAuthLoading, router, fetchBookmarks]);

  const handleRemoveBookmark = async (postId: string) => {
    try {
      await bookmarkService.unbookmarkPost(postId);
      setBookmarks((prev) => prev.filter((b) => b.post?._id !== postId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  if (isAuthLoading || (isLoading && !bookmarks.length)) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-20 rounded-2xl bg-slate-200 animate-pulse" />
        <PostGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
            <Bookmark className="h-3.5 w-3.5" />
            <span>Reading List</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Saved Bookmarks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Articles you have saved to read or reference later.
          </p>
        </div>

        <Link
          href="/blog"
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          Explore More Articles →
        </Link>
      </div>

      {/* Bookmarked Posts Grid */}
      {bookmarks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map(({ post }) => {
              if (!post) return null;
              return (
                <div key={post._id} className="relative group">
                  <PostCard post={post} />
                  <button
                    onClick={() => handleRemoveBookmark(post._id)}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white/95 p-2 text-slate-400 hover:text-rose-600 shadow-md backdrop-blur-sm transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
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
          icon={Bookmark}
          title="No bookmarks saved yet"
          description="Click the bookmark icon on any article to save it to your personal reading list."
          actionText="Discover Articles"
          actionHref="/blog"
        />
      )}
    </div>
  );
}
