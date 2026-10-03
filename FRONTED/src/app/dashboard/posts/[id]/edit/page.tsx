'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post } from '@/types';
import { postService } from '@/services/post.service';
import { useAuth } from '@/context/AuthContext';
import PostForm from '@/components/forms/PostForm';
import { PostDetailSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/posts/${id}/edit`);
      return;
    }

    async function loadPost() {
      if (!id) return;
      try {
        setIsLoading(true);
        // Find post from my-posts list or direct query
        const res = await postService.getMyPosts({ limit: 100 });
        if (res.success && res.data) {
          const found = res.data.find((p) => p._id === id);
          if (found) {
            setPost(found);
          }
        }
      } catch (err) {
        console.error('Failed to load post for editing:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadPost();
    }
  }, [id, user, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PostDetailSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Article Not Found"
          description="The article could not be loaded or you don't have authorization to edit it."
          actionText="Back to My Articles"
          actionHref="/dashboard/posts"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Edit Article
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the content, tags, category, or publication status.
        </p>
      </div>

      <PostForm initialData={post} isEditing={true} />
    </div>
  );
}
