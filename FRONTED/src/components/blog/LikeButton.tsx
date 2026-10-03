'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { likeService } from '@/services/like.service';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postId: string;
  initialCount?: number;
  initialLiked?: boolean;
}

export default function LikeButton({
  postId,
  initialCount = 0,
  initialLiked = false,
}: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [count, setCount] = useState<number>(initialCount);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleToggleLike = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isPending) return;

    // Optimistic UI update
    const nextLiked = !liked;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);
    setLiked(nextLiked);
    setCount(nextCount);
    setIsPending(true);

    try {
      if (nextLiked) {
        const res = await likeService.likePost(postId);
        if (res.success && res.data) {
          setCount(res.data.likeCount);
          setLiked(res.data.isLiked);
        }
      } else {
        const res = await likeService.unlikePost(postId);
        if (res.success && res.data) {
          setCount(res.data.likeCount);
          setLiked(res.data.isLiked);
        }
      }
    } catch {
      // Revert on error
      setLiked(!nextLiked);
      setCount(liked ? count : count);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        liked
          ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm shadow-rose-500/10'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
      aria-label={liked ? 'Unlike post' : 'Like post'}
    >
      <Heart
        className={`h-4 w-4 transition-transform active:scale-125 ${
          liked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
        }`}
      />
      <span>{count}</span>
    </button>
  );
}
