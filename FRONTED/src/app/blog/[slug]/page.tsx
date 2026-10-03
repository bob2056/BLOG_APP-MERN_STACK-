'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Post, PostDetailResult } from '@/types';
import { postService } from '@/services/post.service';
import { formatDate, estimateReadingTime, getMediaUrl } from '@/lib/utils';
import LikeButton from '@/components/blog/LikeButton';
import BookmarkButton from '@/components/blog/BookmarkButton';
import CommentSection from '@/components/blog/CommentSection';
import PostCard from '@/components/blog/PostCard';
import { PostDetailSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { Eye, Clock, Share2, ArrowLeft, Check, Sparkles, MessageCircle } from 'lucide-react';

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [postDetail, setPostDetail] = useState<PostDetailResult | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      try {
        setIsLoading(true);
        const res = await postService.getPostBySlug(slug);
        if (res.success && res.data) {
          setPostDetail(res.data);

          // Concurrently load related posts by category
          if (res.data.post.category?._id) {
            const relRes = await postService.getPosts({
              category: res.data.post.category.slug,
              limit: 3,
            });
            if (relRes.success && relRes.data) {
              setRelatedPosts(relRes.data.filter((p) => p._id !== res.data.post._id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <PostDetailSkeleton />
      </div>
    );
  }

  if (!postDetail) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <EmptyState
          title="Article Not Found"
          description="The essay or dispatch you are looking for may have been archived or moved."
          actionText="Back to Articles"
          onAction={() => router.push('/blog')}
        />
      </div>
    );
  }

  const { post, likeCount, isLiked, isBookmarked } = postDetail;
  const coverUrl = post.coverImage ? getMediaUrl(post.coverImage) : null;
  const authorAvatar = post.author?.avatar ? getMediaUrl(post.author.avatar) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-16">
      {/* Editorial Header Navigation */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-200/70">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Dispatches</span>
        </Link>

        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="text-[11px] uppercase tracking-wider font-sans font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60"
          >
            {post.category.name}
          </Link>
        )}
      </div>

      {/* Main Title & Lead */}
      <div className="space-y-6 mb-8">
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-normal tracking-tight text-ink-900 leading-[1.12]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="font-serif italic text-lg sm:text-xl text-ink-600 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Author Byline Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 pb-6 border-y border-stone-200/80">
          <Link
            href={`/profile/${post.author?.username}`}
            className="flex items-center gap-3.5 group/author"
          >
            {authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorAvatar}
                alt={post.author?.name}
                className="h-11 w-11 rounded-full object-cover ring-1 ring-stone-300"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200 text-ink-900 font-serif font-medium text-base">
                {post.author?.name ? post.author.name.charAt(0) : 'A'}
              </div>
            )}
            <div>
              <span className="text-sm font-sans font-semibold text-ink-900 group-hover/author:text-amber-800 transition-colors block">
                {post.author?.name}
              </span>
              <div className="flex items-center gap-2 text-xs font-sans text-ink-500">
                <time dateTime={post.publishedAt || post.createdAt}>
                  {formatDate(post.publishedAt || post.createdAt)}
                </time>
                <span>•</span>
                <span>{estimateReadingTime(post.content)}</span>
              </div>
            </div>
          </Link>

          {/* Social views & Share button */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-sans text-ink-400" title={`${post.views} views`}>
              <Eye className="h-3.5 w-3.5" />
              <span>{post.views} reads</span>
            </span>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-sans font-medium text-ink-700 hover:bg-stone-50 transition-colors shadow-2xs"
              title="Share article URL"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-ink-400" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {coverUrl && (
        <div className="my-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100 border border-stone-200/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Main Body Content with Reading Typography */}
      <div className="py-6 font-serif text-lg sm:text-[1.2rem] leading-[1.85] text-ink-800 whitespace-pre-wrap selection:bg-stone-800 selection:text-paper-50 space-y-6">
        {post.content}
      </div>

      {/* Tag Badges */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 my-8 pt-6 border-t border-stone-200/80">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="rounded-lg bg-stone-100/90 px-3 py-1.5 text-xs font-sans text-ink-700 hover:bg-stone-200 hover:text-ink-900 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Sticky / Ambient Reaction Bar */}
      <div className="sticky bottom-6 z-20 flex items-center justify-between rounded-full border border-stone-300/80 bg-white/95 backdrop-blur-md px-5 py-2.5 shadow-lg my-10 max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post._id}
            initialCount={likeCount}
            initialLiked={isLiked}
          />
          <BookmarkButton
            postId={post._id}
            initialBookmarked={isBookmarked}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const el = document.getElementById('comments-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-ink-600 hover:text-ink-900 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Discussion</span>
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-stone-100 transition-colors"
            title="Copy URL"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Author Colophon Box */}
      {post.author && (
        <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-6 sm:p-8 my-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorAvatar}
              alt={post.author.name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-stone-200 shrink-0"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 text-ink-900 font-serif font-medium text-xl shrink-0">
              {post.author.name.charAt(0)}
            </div>
          )}
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="font-serif text-lg font-medium text-ink-900">{post.author.name}</h4>
                <p className="text-xs font-sans text-ink-500">@{post.author.username}</p>
              </div>
              <Link
                href={`/profile/${post.author.username}`}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-3.5 py-1 text-xs font-sans font-medium text-ink-900 hover:bg-stone-50 transition-colors"
              >
                View Profile
              </Link>
            </div>
            <p className="font-sans text-sm text-ink-600 pt-1 leading-relaxed">
              {post.author.bio || 'Author and contributor exploring systems design, architectural patterns, and engineering crafts.'}
            </p>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div id="comments-section">
        <CommentSection postId={post._id} />
      </div>

      {/* Related Curated Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-stone-200/80">
          <div className="mb-8">
            <span className="font-serif italic text-amber-800 text-xs block mb-1">
              Read Further
            </span>
            <h3 className="font-serif text-2xl font-normal text-ink-900">
              Related Dispatches
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relPost) => (
              <PostCard key={relPost._id} post={relPost} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
