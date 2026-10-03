'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMediaUrl } from '@/lib/utils';
import {
  Search,
  PenLine,
  Bookmark,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const userAvatar = user?.avatar ? getMediaUrl(user.avatar) : null;

  return (
    <header className="sticky top-0 z-40 bg-paper-50/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Editorial Masthead Ticker Bar */}
      <div className="hidden md:flex items-center justify-between border-b border-stone-200/50 px-6 py-1.5 text-[11px] font-sans text-ink-500 tracking-wide">
        <div className="flex items-center gap-3">
          <span className="font-medium text-ink-700">Saturday, October 3, 2026</span>
          <span>•</span>
          <span>Curated Edition No. 42</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="italic font-serif text-ink-600">
            &ldquo;Engineering, craftsmanship, and thoughtful essays.&rdquo;
          </span>
          <span>•</span>
          <Link href="/blog" className="hover:text-ink-900 transition-colors">
            Today&apos;s Dispatches
          </Link>
        </div>
      </div>

      {/* Main Masthead Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-baseline gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink-900 group-hover:text-stone-700 transition-colors">
                Chronicle
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-700 inline-block mb-1 group-hover:scale-125 transition-transform" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-sans font-medium text-ink-600">
              <Link
                href="/blog"
                className={`hover:text-ink-900 transition-colors ${
                  pathname === '/blog' ? 'text-ink-900 font-semibold' : ''
                }`}
              >
                All Articles
              </Link>
              <Link
                href="/search"
                className={`hover:text-ink-900 transition-colors ${
                  pathname === '/search' ? 'text-ink-900 font-semibold' : ''
                }`}
              >
                Search
              </Link>
              {user && (
                <Link
                  href="/bookmarks"
                  className={`hover:text-ink-900 transition-colors ${
                    pathname === '/bookmarks' ? 'text-ink-900 font-semibold' : ''
                  }`}
                >
                  Reading List
                </Link>
              )}
            </nav>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search essays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-stone-100/90 pl-9 pr-8 py-1.5 text-xs text-ink-900 placeholder:text-ink-400 border border-stone-200/60 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-stone-200/70 px-1.5 py-0.5 text-[10px] text-ink-500 font-mono pointer-events-none">
                /
              </span>
            </form>

            {/* Write Button */}
            <Link
              href="/dashboard/posts/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-1.5 text-xs font-medium text-paper-50 hover:bg-stone-800 active:scale-95 transition-all shadow-sm"
            >
              <PenLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Write</span>
            </Link>

            {/* Authentication Menu */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full p-0.5 ring-1 ring-stone-200 hover:ring-stone-400 transition-all focus:outline-none"
                  aria-label="User profile menu"
                >
                  {userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userAvatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-ink-900 text-xs font-serif font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 rounded-xl bg-white p-2 text-ink-700 shadow-xl border border-stone-200/80 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    {/* User Summary */}
                    <div className="border-b border-stone-100 px-3 py-2.5">
                      <p className="text-xs font-semibold text-ink-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-500 truncate">@{user.username}</p>
                      <span className="mt-1 inline-block rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-700">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs hover:bg-stone-50 transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-ink-400" />
                        <span>Public Profile</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs hover:bg-stone-50 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-ink-400" />
                        <span>Author Studio</span>
                      </Link>

                      <Link
                        href="/dashboard/posts"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs hover:bg-stone-50 transition-colors"
                      >
                        <PenLine className="h-4 w-4 text-ink-400" />
                        <span>Manage Articles</span>
                      </Link>

                      <Link
                        href="/bookmarks"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs hover:bg-stone-50 transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-ink-400" />
                        <span>Reading List</span>
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs hover:bg-stone-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-ink-400" />
                        <span>Account Settings</span>
                      </Link>

                      {isAdmin && (
                        <div className="border-t border-stone-100 my-1 pt-1">
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 transition-colors"
                          >
                            <ShieldCheck className="h-4 w-4 text-amber-700" />
                            <span>Editor-in-Chief Panel</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-700 hover:text-ink-900 hover:bg-stone-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-900 hover:bg-stone-50 transition-all shadow-2xs"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-ink-600 hover:text-ink-900 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200/80 py-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search essays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-stone-100 pl-10 pr-4 py-2 text-sm text-ink-900 placeholder:text-ink-400 border border-stone-200 focus:outline-none focus:bg-white"
              />
            </form>

            <nav className="flex flex-col space-y-2 text-sm font-sans">
              <Link
                href="/blog"
                className="px-3 py-2 rounded-lg text-ink-700 hover:bg-stone-100 transition-colors"
              >
                All Articles
              </Link>
              <Link
                href="/search"
                className="px-3 py-2 rounded-lg text-ink-700 hover:bg-stone-100 transition-colors"
              >
                Search Catalog
              </Link>
              {user && (
                <Link
                  href="/bookmarks"
                  className="px-3 py-2 rounded-lg text-ink-700 hover:bg-stone-100 transition-colors"
                >
                  Reading List
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
