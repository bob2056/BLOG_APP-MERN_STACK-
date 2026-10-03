'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, Post } from '@/types';
import { userService } from '@/services/user.service';
import { postService } from '@/services/post.service';
import { useAuth } from '@/context/AuthContext';
import PostCard from '@/components/blog/PostCard';
import { PostGridSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { getMediaUrl, formatDate } from '@/lib/utils';
import { UserCheck, UserPlus, Calendar, Settings, FileText } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [stats, setStats] = useState<{ postsCount: number; followersCount: number; followingCount: number }>({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
  });
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFollowPending, setIsFollowPending] = useState<boolean>(false);

  const isOwnProfile = currentUser && profileUser && currentUser.username === profileUser.username;

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      try {
        setIsLoading(true);
        const res = await userService.getProfile(username);
        if (res.success && res.data) {
          setProfileUser(res.data.user);
          setStats(res.data.stats);

          // Concurrently fetch this author's published posts
          const postsRes = await postService.getPosts({ author: username, limit: 12 });
          if (postsRes.success && postsRes.data) {
            setUserPosts(postsRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  const handleToggleFollow = async () => {
    if (!profileUser || isFollowPending || !currentUser) return;

    setIsFollowPending(true);
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setStats((prev) => ({
      ...prev,
      followersCount: nextFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
    }));

    try {
      if (nextFollowing) {
        await userService.followUser(profileUser._id);
      } else {
        await userService.unfollowUser(profileUser._id);
      }
    } catch {
      // Revert on error
      setIsFollowing(!nextFollowing);
      setStats((prev) => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount : prev.followersCount,
      }));
    } finally {
      setIsFollowPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 animate-pulse space-y-8">
        <div className="h-48 rounded-3xl bg-slate-200" />
        <PostGridSkeleton count={6} />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          title="User Not Found"
          description={`The user '@${username}' does not exist or has deactivated their profile.`}
          actionText="Explore Articles"
          actionHref="/blog"
        />
      </div>
    );
  }

  const avatarUrl = profileUser.avatar ? getMediaUrl(profileUser.avatar) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={profileUser.name}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-indigo-50 shadow-md"
            />
          ) : (
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-3xl font-extrabold ring-4 ring-indigo-50 shadow-md">
              {profileUser.name.charAt(0)}
            </div>
          )}

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {profileUser.name}
                </h1>
                <p className="text-sm font-semibold text-indigo-600">@{profileUser.username}</p>
              </div>

              {/* Action Button: Edit or Follow */}
              <div>
                {isOwnProfile ? (
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span>Edit Profile</span>
                  </Link>
                ) : currentUser ? (
                  <button
                    onClick={handleToggleFollow}
                    disabled={isFollowPending}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition-all ${
                      isFollowing
                        ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Follow Author</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    Follow Author
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl pt-1">
              {profileUser.bio || 'Staff author and engineering contributor on DevLog.'}
            </p>

            {/* Metrics & Meta */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Joined {formatDate(profileUser.createdAt)}
              </span>
              <span>
                <strong className="text-slate-800 font-semibold">{stats.postsCount}</strong> Articles
              </span>
              <span>
                <strong className="text-slate-800 font-semibold">{stats.followersCount}</strong> Followers
              </span>
              <span>
                <strong className="text-slate-800 font-semibold">{stats.followingCount}</strong> Following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Published Articles by Author */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Published Articles ({userPosts.length})
          </h2>
        </div>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {userPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No published articles yet"
            description={`@${profileUser.username} hasn't published any articles so far.`}
          />
        )}
      </div>
    </div>
  );
}
