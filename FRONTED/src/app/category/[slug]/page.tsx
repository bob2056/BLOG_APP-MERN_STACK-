'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Category, Post, PaginationMeta } from '@/types';
import { categoryService } from '@/services/category.service';
import { postService } from '@/services/post.service';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/common/Pagination';
import { PostGridSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { Layers } from 'lucide-react';

export default function CategoryPostsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCategoryAndPosts() {
      if (!slug) return;
      try {
        setIsLoading(true);
        const [catRes, postsRes] = await Promise.all([
          categoryService.getCategoryBySlug(slug),
          postService.getPosts({ category: slug, page, limit: 9 }),
        ]);

        if (catRes.success && catRes.data) {
          setCategory(catRes.data);
        }
        if (postsRes.success && postsRes.data) {
          setPosts(postsRes.data);
          if (postsRes.pagination) setPagination(postsRes.pagination);
        }
      } catch (err) {
        console.error('Failed to load category posts:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoryAndPosts();
  }, [slug, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Category Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Layers className="h-3.5 w-3.5" />
            <span>Category Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl text-slate-900 tracking-tight">
            {category?.name || slug}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {category?.description || `Browse all engineering articles published under ${category?.name || slug}.`}
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-center min-w-[120px]">
          <span className="text-2xl font-black text-indigo-600 block">
            {pagination?.total ?? posts.length}
          </span>
          <span className="text-xs font-medium text-indigo-900/70">Articles</span>
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
          title={`No articles under '${category?.name || slug}' yet`}
          description="Check back soon or explore other topics in our catalogue."
          actionText="Browse All Articles"
          actionHref="/blog"
        />
      )}
    </div>
  );
}
