'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/admin.service';
import { categoryService } from '@/services/category.service';
import AdminHeader from '@/components/admin/AdminHeader';
import { Users, FileText, MessageSquare, FolderTree, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AdminOverviewPage() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    usersCount: 0,
    postsCount: 0,
    commentsCount: 0,
    categoriesCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    async function loadAdminStats() {
      try {
        setIsLoading(true);
        const [usersRes, postsRes, commentsRes, catRes] = await Promise.all([
          adminService.getUsers({ limit: 1 }),
          adminService.getPosts({ limit: 1 }),
          adminService.getComments({ limit: 1 }),
          categoryService.getCategories(),
        ]);

        setStats({
          usersCount: usersRes.pagination?.total ?? 0,
          postsCount: postsRes.pagination?.total ?? 0,
          commentsCount: commentsRes.pagination?.total ?? 0,
          categoriesCount: catRes.data?.length ?? 0,
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user && isAdmin) {
      loadAdminStats();
    }
  }, [user, isAdmin, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 animate-pulse" />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-1">
          Administrator privileges are required to view this panel.
        </p>
      </div>
    );
  }

  const sections = [
    {
      title: 'User Management',
      count: stats.usersCount,
      label: 'Registered Accounts',
      description: 'Inspect user roles, toggle account activation status, or purge problematic accounts.',
      icon: Users,
      href: '/admin/users',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Post Moderation',
      count: stats.postsCount,
      label: 'Articles across all statuses',
      description: 'Audit published articles, review author drafts, and remove policy-violating posts.',
      icon: FileText,
      href: '/admin/posts',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Comment Oversight',
      count: stats.commentsCount,
      label: 'Platform comments & replies',
      description: 'Moderate community discussions, remove spam, and maintain conversation standards.',
      icon: MessageSquare,
      href: '/admin/comments',
      color: 'text-sky-600 bg-sky-50',
    },
    {
      title: 'Category Taxonomy',
      count: stats.categoriesCount,
      label: 'Topic categories',
      description: 'Create new taxonomy categories, update slugs and descriptions, and upload category banners.',
      icon: FolderTree,
      href: '/admin/categories',
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <AdminHeader
        title="Platform Administration"
        subtitle="Full administrative control over user accounts, article moderation, and category taxonomy."
      />

      {/* Grid of administrative domains */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.href}
              className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${sec.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 block">{sec.count}</span>
                  <span className="text-xs font-semibold text-slate-400">{sec.label}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{sec.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{sec.description}</p>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <Link
                  href={sec.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Manage {sec.title}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
