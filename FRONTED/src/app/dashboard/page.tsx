'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { postService } from '@/services/post.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Bookmark,
  PenSquare,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    async function loadDashboardData() {
      if (!user) return;
      try {
        setIsLoading(true);
        const [postsRes, bkmkRes] = await Promise.all([
          postService.getMyPosts({ limit: 50 }),
          userService.getMyBookmarks(1, 1),
        ]);

        if (postsRes.success && postsRes.data) {
          setPosts(postsRes.data);
        }
        if (bkmkRes.success && bkmkRes.pagination) {
          setBookmarkCount(bkmkRes.pagination.total);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, isAuthLoading, router]);

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      await postService.deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  if (isAuthLoading || (isLoading && !posts.length)) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  // Calculate metrics
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftPosts = posts.filter((p) => p.status === 'DRAFT').length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <DashboardHeader
        title={`Welcome back, ${user?.name || 'Author'}`}
        subtitle="Manage your publications, review performance analytics, and draft new stories."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-10">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Posts
            </span>
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalPosts}</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Published
            </span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{publishedPosts}</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Drafts
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{draftPosts}</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Views
            </span>
            <Eye className="h-4 w-4 text-sky-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalViews}</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bookmarks
            </span>
            <Bookmark className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{bookmarkCount}</span>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Recent Articles</h2>
          <Link
            href="/dashboard/posts"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all ({posts.length}) →
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentPosts.map((post) => (
                    <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
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
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/posts/${post._id}/edit`}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Edit post"
                          >
                            <PenSquare className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post._id)}
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
        ) : (
          <EmptyState
            title="No posts yet"
            description="You haven't written any articles yet. Create your first post and share your expertise with the world!"
            actionText="Write First Post"
            actionHref="/dashboard/posts/create"
          />
        )}
      </div>
    </div>
  );
}
