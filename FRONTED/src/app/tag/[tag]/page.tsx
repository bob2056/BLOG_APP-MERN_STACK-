'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Post, PaginationMeta } from '@/types';
import { postService } from '@/services/post.service';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/common/Pagination';
import { PostGridSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { Tag } from 'lucide-react';

export default function TagPostsPage() {
  const params = useParams();
  const rawTag = params.tag as string;
  const tag = decodeURIComponent(rawTag);

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTagPosts() {
      if (!tag) return;
      try {
        setIsLoading(true);
        const res = await postService.getPosts({ tag, page, limit: 9 });
        if (res.success && res.data) {
          setPosts(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to load tag posts:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTagPosts();
  }, [tag, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 shadow-sm flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
            <Tag className="h-3.5 w-3.5" />
            <span>Tag Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl text-slate-900 tracking-tight">
            #{tag}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Articles tagged with #{tag}.
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-center min-w-[100px]">
          <span className="text-2xl font-black text-indigo-600 block">
            {pagination?.total ?? posts.length}
          </span>
          <span className="text-xs font-medium text-indigo-900/70">Posts</span>
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <PostGridSkeleton count={6} />
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
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
          title={`No articles tagged #${tag}`}
          description="Try browsing all articles or exploring other tags."
          actionText="Browse All Articles"
          actionHref="/blog"
        />
      )}
    </div>
  );
}
