'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, PenSquare, Settings } from 'lucide-react';

export default function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/posts', label: 'My Articles', icon: FileText, exact: false },
    { href: '/dashboard/posts/create', label: 'Write New', icon: PenSquare, exact: true },
    { href: '/dashboard/settings', label: 'Account Settings', icon: Settings, exact: true },
  ];

  return (
    <div className="mb-8 border-b border-slate-200 pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <Link
          href="/dashboard/posts/create"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PenSquare className="h-4 w-4" />
          <span>New Article</span>
        </Link>
      </div>

      <nav className="flex space-x-2 overflow-x-auto pb-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href) && link.href !== '/dashboard';

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
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
