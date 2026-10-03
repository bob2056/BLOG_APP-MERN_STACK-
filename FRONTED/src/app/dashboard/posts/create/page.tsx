'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PostForm from '@/components/forms/PostForm';

export default function CreatePostPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/dashboard/posts/create');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 animate-pulse">
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create New Article
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Draft your thoughts, add tags, select a category, and publish to the world.
        </p>
      </div>

      <PostForm />
    </div>
  );
}
