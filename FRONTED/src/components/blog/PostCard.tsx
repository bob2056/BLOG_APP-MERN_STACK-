'use client';

import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { formatDate, estimateReadingTime, getMediaUrl } from '@/lib/utils';
import { Eye, ArrowUpRight } from 'lucide-react';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export default function PostCard({ post }: PostCardProps) {
  const coverUrl = post.coverImage
    ? getMediaUrl(post.coverImage)
    : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';

  const authorAvatar = post.author?.avatar
    ? getMediaUrl(post.author.avatar)
    : null;

  return (
    <article className="group flex flex-col paper-card rounded-2xl overflow-hidden bg-white border border-stone-200/80 hover:border-stone-400/80 transition-all duration-300">
      {/* Cover Image Container */}
      <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';
          }}
        />
        {post.category && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-medium tracking-wide text-ink-800 shadow-sm border border-stone-200/60 uppercase">
            {post.category.name}
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Date and Reading time metadata */}
        <div className="flex items-center gap-2 text-xs text-ink-500 font-sans mb-3">
          <time dateTime={post.publishedAt || post.createdAt}>
            {formatDate(post.publishedAt || post.createdAt)}
          </time>
          <span>•</span>
          <span>{estimateReadingTime(post.content)}</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-ink-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug mb-2.5">
          <Link href={`/blog/${post.slug}`} className="inline-flex items-baseline gap-1">
            <span>{post.title}</span>
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm font-sans text-ink-600 line-clamp-2 leading-relaxed mb-5">
          {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...'}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="rounded-md bg-stone-100/90 px-2.5 py-0.5 text-[11px] font-sans text-ink-600 hover:bg-stone-200 hover:text-ink-900 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Footer: Author & Views */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-200/70">
          <Link
            href={`/profile/${post.author?.username}`}
            className="flex items-center gap-2.5 group/author"
          >
            {authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorAvatar}
                alt={post.author.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-stone-200"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-ink-800 text-xs font-serif font-medium">
                {post.author?.name ? post.author.name.charAt(0) : 'A'}
              </div>
            )}
            <span className="text-xs font-sans font-medium text-ink-800 group-hover/author:text-amber-800 transition-colors">
              {post.author?.name || 'Anonymous'}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-ink-400 font-sans">
            <span className="flex items-center gap-1" title={`${post.views || 0} views`}>
              <Eye className="h-3.5 w-3.5" />
              {post.views || 0}
            </span>
            <Link
              href={`/blog/${post.slug}`}
              className="text-ink-400 group-hover:text-ink-900 transition-colors"
              aria-label="Read article"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
