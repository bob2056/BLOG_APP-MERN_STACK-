import React from 'react';

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="aspect-[16/9] w-full rounded-xl bg-slate-200 mb-4" />
      
      {/* Badge & Date */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-20 rounded-md bg-slate-200" />
        <div className="h-4 w-16 rounded bg-slate-100" />
      </div>

      {/* Title */}
      <div className="h-6 w-3/4 rounded bg-slate-200 mb-2" />
      <div className="h-6 w-1/2 rounded bg-slate-200 mb-3" />

      {/* Excerpt */}
      <div className="h-4 w-full rounded bg-slate-100 mb-1" />
      <div className="h-4 w-5/6 rounded bg-slate-100 mb-4" />

      {/* Author Footer */}
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
        <div className="h-4 w-12 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-none">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 rounded bg-slate-200" />
              <div className="h-3 w-28 rounded bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-16 rounded bg-slate-100" />
            <div className="h-8 w-20 rounded-md bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-pulse space-y-6">
      <div className="h-5 w-28 rounded bg-slate-200" />
      <div className="h-10 w-3/4 rounded bg-slate-200" />
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="space-y-1">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="aspect-[21/9] w-full rounded-2xl bg-slate-200" />
      <div className="space-y-3 pt-4">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
      </div>
    </div>
  );
}
