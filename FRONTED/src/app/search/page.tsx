'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Post, PaginationMeta } from '@/types';
import { searchService } from '@/services/search.service';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/common/Pagination';
import { PostGridSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [inputVal, setInputVal] = useState<string>(q);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const performSearch = useCallback(async () => {
    if (!q.trim()) {
      setPosts([]);
      setPagination(null);
      return;
    }

    try {
      setIsLoading(true);
      const res = await searchService.searchPosts(q.trim(), page, 9);
      if (res.success && res.data) {
        setPosts(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    setInputVal(q);
    performSearch();
  }, [q, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold sm:text-4xl text-slate-900 tracking-tight">
          Search Articles
        </h1>
        <p className="text-sm text-slate-500">
          Search through titles, summaries, tags, and complete article content.
        </p>

        <form onSubmit={handleSubmit} className="relative mt-6">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type your query (e.g. nodejs, api, mongodb)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-28 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Query stats */}
      {q && (
        <div className="border-b border-slate-200 pb-3 text-sm text-slate-600">
          Showing results for <span className="font-semibold text-slate-900">&quot;{q}&quot;</span>{' '}
          {pagination && <span>({pagination.total} matching articles)</span>}
        </div>
      )}

      {/* Results grid */}
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
              onPageChange={(newPage) => {
                router.push(`/search?q=${encodeURIComponent(q)}&page=${newPage}`);
              }}
            />
          )}
        </>
      ) : q ? (
        <EmptyState
          title={`No results found for "${q}"`}
          description="Try checking for spelling errors, using simpler keywords, or browsing our full articles catalogue."
          actionText="Explore All Articles"
          actionHref="/blog"
        />
      ) : (
        <div className="text-center py-12 text-slate-400 text-sm">
          Enter a search term above to begin querying articles.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <PostGridSkeleton count={6} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
