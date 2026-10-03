'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post, Category } from '@/types';
import { postService } from '@/services/post.service';
import { categoryService } from '@/services/category.service';
import PostCard from '@/components/blog/PostCard';
import { PostGridSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, estimateReadingTime, getMediaUrl } from '@/lib/utils';
import { ArrowRight, Sparkles, TrendingUp, Feather, BookOpen, Mail } from 'lucide-react';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        const [postsRes, catRes, popRes] = await Promise.all([
          postService.getPosts({ page: 1, limit: 7, sort: 'newest' }),
          categoryService.getCategories(),
          postService.getPosts({ page: 1, limit: 4, sort: 'most_viewed' }),
        ]);

        if (postsRes.success && postsRes.data) {
          setPosts(postsRes.data);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (popRes.success && popRes.data) {
          setPopularPosts(popRes.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  // Extract popular tags
  const tagsSet = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));
  popularPosts.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));
  const popularTags = Array.from(tagsSet).slice(0, 8);

  return (
    <div className="space-y-16 py-8">
      {/* 1. Editorial Hero & Staff Picks Magazine Split */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="h-96 rounded-2xl bg-stone-200/60 animate-pulse" />
        ) : featuredPost ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-12 border-b border-stone-200/80">
            {/* Left: Lead Cover Story */}
            <div className="lg:col-span-8 flex flex-col group">
              <Link href={`/blog/${featuredPost.slug}`} className="block relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100 mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    featuredPost.coverImage
                      ? getMediaUrl(featuredPost.coverImage)
                      : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'
                  }
                  alt={featuredPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                {featuredPost.category && (
                  <span className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-xs font-medium tracking-wide uppercase text-ink-800 border border-stone-200/60 shadow-sm">
                    {featuredPost.category.name}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-3 text-xs text-ink-500 font-sans mb-3">
                <span className="font-semibold text-amber-800 tracking-wider uppercase text-[11px]">
                  Featured Lead
                </span>
                <span>•</span>
                <time dateTime={featuredPost.publishedAt || featuredPost.createdAt}>
                  {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                </time>
                <span>•</span>
                <span>{estimateReadingTime(featuredPost.content)}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-ink-900 group-hover:text-amber-800 transition-colors leading-[1.15] mb-4">
                <Link href={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h1>

              <p className="font-sans text-base sm:text-lg text-ink-600 line-clamp-3 leading-relaxed mb-6">
                {featuredPost.excerpt || featuredPost.content.replace(/<[^>]*>?/gm, '').slice(0, 220) + '...'}
              </p>

              {/* Author & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200/60 mt-auto">
                <Link
                  href={`/profile/${featuredPost.author?.username}`}
                  className="flex items-center gap-3 group/author"
                >
                  {featuredPost.author?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaUrl(featuredPost.author.avatar)}
                      alt={featuredPost.author.name}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-stone-200"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-ink-900 font-serif font-semibold text-sm">
                      {featuredPost.author?.name ? featuredPost.author.name.charAt(0) : 'U'}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-sans font-medium text-ink-900 group-hover/author:text-amber-800 transition-colors block">
                      {featuredPost.author?.name}
                    </span>
                    <span className="text-xs text-ink-400">
                      @{featuredPost.author?.username}
                    </span>
                  </div>
                </Link>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2 text-xs font-sans font-medium text-paper-50 hover:bg-stone-800 active:scale-95 transition-all shadow-sm"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Curated Picks & Trending Column */}
            <div className="lg:col-span-4 flex flex-col space-y-6 lg:border-l lg:border-stone-200/80 lg:pl-8">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-200/60">
                <Sparkles className="h-4 w-4 text-amber-700" />
                <h2 className="font-serif text-lg font-medium text-ink-900">
                  Curator&apos;s Selection
                </h2>
              </div>

              <div className="space-y-6">
                {(popularPosts.length > 0 ? popularPosts : posts.slice(1, 4)).map((post, idx) => (
                  <article key={post._id} className="group flex items-start gap-4">
                    <span className="font-serif text-2xl font-light text-stone-300 group-hover:text-amber-700 transition-colors">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-[11px] font-sans text-ink-400">
                        <span>{post.author?.name}</span>
                        <span>•</span>
                        <span>{estimateReadingTime(post.content)}</span>
                      </div>
                      <h3 className="font-serif text-base font-normal text-ink-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      {post.category && (
                        <span className="inline-block text-[10px] uppercase font-sans tracking-wider text-ink-500 bg-stone-100 px-2 py-0.5 rounded">
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {/* Callout box */}
              <div className="mt-8 rounded-xl bg-stone-100/70 p-5 border border-stone-200/70">
                <div className="flex items-center gap-2 text-ink-800 font-serif font-medium text-sm mb-1.5">
                  <Feather className="h-4 w-4 text-amber-700" />
                  <span>Contribute an Essay</span>
                </div>
                <p className="text-xs font-sans text-ink-600 leading-relaxed mb-3">
                  Have insights on engineering, system designs, or software craftsmanship? Share your perspective with our community.
                </p>
                <Link
                  href="/dashboard/posts/create"
                  className="text-xs font-sans font-semibold text-ink-900 hover:text-amber-800 transition-colors inline-flex items-center gap-1"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Welcome to Chronicle"
            description="No essays published yet. Be the first author to submit a story!"
            actionText="Write First Essay"
            actionHref="/dashboard/posts/create"
          />
        )}
      </section>

      {/* 2. Topics Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-6">
          <h2 className="font-serif text-2xl font-normal text-ink-900">
            Topics in Focus
          </h2>
          <Link
            href="/blog"
            className="text-xs font-sans font-medium text-ink-600 hover:text-ink-900 transition-colors flex items-center gap-1"
          >
            <span>Explore Archive</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="group paper-card p-5 rounded-xl border border-stone-200/80 hover:border-stone-400/80 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-serif text-xs text-amber-700 tracking-wider uppercase block mb-1">
                  Topic
                </span>
                <h3 className="font-serif text-lg font-medium text-ink-900 group-hover:text-amber-800 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs font-sans text-ink-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-ink-400 font-sans">
                <span>View collection</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Latest Dispatches Magazine Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink-900">
              Latest Dispatches
            </h2>
            <p className="text-xs font-sans text-ink-500 mt-1">
              Fresh perspectives, technical deep dives, and commentary from our writers
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-sans font-medium text-ink-700 hover:text-ink-900 transition-colors flex items-center gap-1"
          >
            <span>Browse All ({posts.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-ink-400 font-sans text-sm">
            More articles are currently being drafted by our authors.
          </div>
        )}
      </section>

      {/* 4. Newsletter Dispatch Letterbox */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-stone-300/80 bg-stone-100/60 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="font-serif italic text-amber-800 text-sm block mb-2">
              The Sunday Dispatch
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink-900 mb-3">
              Curated ideas on software architecture & crafts, straight to your inbox.
            </h2>
            <p className="font-sans text-sm text-ink-600 leading-relaxed mb-6">
              Every Sunday morning, we send a thoughtfully edited summary of key engineering essays, architecture trade-offs, and books worth reading. No spam, ever.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to The Sunday Dispatch!');
              }}
              className="flex flex-col sm:flex-row gap-2.5 max-w-md"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-sans text-ink-900 placeholder:text-ink-400 border border-stone-300 focus:outline-none focus:border-stone-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-ink-900 px-5 py-2.5 text-xs font-sans font-medium text-paper-50 hover:bg-stone-800 transition-all shadow-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. Popular Tags Cloud */}
      {popularTags.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          <div className="pt-8 border-t border-stone-200/80">
            <h3 className="font-serif text-sm font-medium text-ink-700 mb-3">
              Frequently Explored Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-sans text-ink-600 hover:bg-stone-200 hover:text-ink-900 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
