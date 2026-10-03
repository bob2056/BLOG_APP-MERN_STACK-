'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { bookmarkService } from '@/services/bookmark.service';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked?: boolean;
}

export default function BookmarkButton({
  postId,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [bookmarked, setBookmarked] = useState<boolean>(initialBookmarked);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleToggleBookmark = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isPending) return;

    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked);
    setIsPending(true);

    try {
      if (nextBookmarked) {
        await bookmarkService.bookmarkPost(postId);
      } else {
        await bookmarkService.unbookmarkPost(postId);
      }
    } catch {
      // Revert on error
      setBookmarked(!nextBookmarked);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
        bookmarked
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
      title={bookmarked ? 'Saved to bookmarks' : 'Save post'}
    >
      <Bookmark
        className={`h-4 w-4 ${
          bookmarked ? 'fill-indigo-600 text-indigo-600' : 'text-slate-500'
        }`}
      />
      <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
}
