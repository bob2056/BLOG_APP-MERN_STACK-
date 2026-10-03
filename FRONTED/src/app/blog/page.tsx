'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Post, Category, PaginationMeta } from '@/types';
import { postService } from '@/services/post.service';
import { categoryService } from '@/services/category.service';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/common/Pagination';
import { PostGridSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { Search, Filter, SlidersHorizontal, BookOpen } from 'lucide-react';

function BlogListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'most_viewed';

  const [searchInput, setSearchInput] = useState<string>(search);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await postService.getPosts({
        page,
        limit: 9,
        search: search || undefined,
        category: category || undefined,
        tag: tag || undefined,
        sort,
      });

      if (res.success && res.data) {
        setPosts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, tag, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Update query params in URL
  const updateQuery = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    }
    router.push(`/blog?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput.trim(), page: 1 });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Discover Knowledge</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-5xl tracking-tight leading-tight">
            Explore All Articles
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/80 leading-relaxed">
            In-depth guides, architectural blueprints, and engineering write-ups written by passionate developers.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords or titles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        {/* Category & Sorting Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={category}
              onChange={(e) => updateQuery({ category: e.target.value, page: 1 })}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => updateQuery({ sort: e.target.value, page: 1 })}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_viewed">Most Viewed</option>
            </select>
          </div>

          {/* Clear Filters Button if any filter is active */}
          {(search || category || tag || sort !== 'newest') && (
            <button
              onClick={() => router.push('/blog')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags Indicator */}
      {(category || tag || search) && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
          <span>Active filter:</span>
          {category && (
            <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-indigo-700 font-medium">
              Category: {category}
            </span>
          )}
          {tag && (
            <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-indigo-700 font-medium">
              Tag: #{tag}
            </span>
          )}
          {search && (
            <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-indigo-700 font-medium">
              Query: &quot;{search}&quot;
            </span>
          )}
        </div>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <PostGridSkeleton count={9} />
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => updateQuery({ page: newPage })}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="No articles found"
          description="We couldn't find any articles matching your search or filters. Try adjusting your parameters."
          actionText="Clear All Filters"
          onAction={() => router.push('/blog')}
        />
      )}
    </div>
  );
}

export default function BlogListingPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <PostGridSkeleton count={9} />
      </div>
    }>
      <BlogListingContent />
    </Suspense>
  );
}
