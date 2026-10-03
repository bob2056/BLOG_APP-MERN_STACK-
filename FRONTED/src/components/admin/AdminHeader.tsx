'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Users, FileText, MessageSquare, FolderTree } from 'lucide-react';

export default function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Overview', icon: ShieldCheck, exact: true },
    { href: '/admin/users', label: 'User Directory', icon: Users, exact: false },
    { href: '/admin/posts', label: 'All Articles', icon: FileText, exact: false },
    { href: '/admin/comments', label: 'Comment Moderation', icon: MessageSquare, exact: false },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree, exact: false },
  ];

  return (
    <div className="mb-8 border-b border-slate-200 pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-slate-500 hover:text-indigo-600 transition-colors self-start sm:self-auto"
        >
          ← Return to User Dashboard
        </Link>
      </div>

      <nav className="flex space-x-2 overflow-x-auto pb-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href) && link.href !== '/admin';

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-amber-100/70 text-amber-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
