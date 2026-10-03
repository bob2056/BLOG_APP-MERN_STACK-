'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Feather } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-stone-100/60 pt-16 pb-12 text-ink-600 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 pb-12 border-b border-stone-200/80">
          {/* Brand Colophon */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-baseline gap-1.5 group">
              <span className="font-serif text-2xl font-medium tracking-tight text-ink-900 group-hover:text-stone-700 transition-colors">
                Chronicle
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-700 inline-block mb-0.5" />
            </Link>
            <p className="font-sans text-xs sm:text-sm text-ink-500 leading-relaxed max-w-sm">
              An independent literary publication dedicated to software architecture, distributed systems, digital crafts, and thoughtful essays.
            </p>
            <div className="flex items-center gap-3 pt-2 text-ink-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg hover:bg-stone-200/60 hover:text-ink-900 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg hover:bg-stone-200/60 hover:text-ink-900 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg hover:bg-stone-200/60 hover:text-ink-900 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column: Editorial */}
          <div className="space-y-3 font-sans text-xs">
            <h4 className="font-serif text-sm font-medium text-ink-900">Publication</h4>
            <ul className="space-y-2.5 text-ink-500">
              <li>
                <Link href="/blog" className="hover:text-ink-900 transition-colors">
                  All Dispatches
                </Link>
              </li>
              <li>
                <Link href="/blog?sort=most_viewed" className="hover:text-ink-900 transition-colors">
                  Most Read Essays
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-ink-900 transition-colors">
                  Search Catalog
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-ink-900 transition-colors">
                  Saved Reading List
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Topics */}
          <div className="space-y-3 font-sans text-xs">
            <h4 className="font-serif text-sm font-medium text-ink-900">Fields of Study</h4>
            <ul className="space-y-2.5 text-ink-500">
              <li>
                <Link href="/category/web-development" className="hover:text-ink-900 transition-colors">
                  Web & Interface Design
                </Link>
              </li>
              <li>
                <Link href="/category/database-architecture" className="hover:text-ink-900 transition-colors">
                  Databases & Storage
                </Link>
              </li>
              <li>
                <Link href="/category/devops-security" className="hover:text-ink-900 transition-colors">
                  Distributed Systems
                </Link>
              </li>
              <li>
                <Link href="/category/technology" className="hover:text-ink-900 transition-colors">
                  Technology Trends
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Author Studio */}
          <div className="space-y-3 font-sans text-xs">
            <h4 className="font-serif text-sm font-medium text-ink-900">Writers & Staff</h4>
            <ul className="space-y-2.5 text-ink-500">
              <li>
                <Link href="/dashboard/posts/create" className="hover:text-ink-900 transition-colors flex items-center gap-1.5">
                  <Feather className="h-3.5 w-3.5 text-amber-700" />
                  <span>Submit an Essay</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink-900 transition-colors">
                  Author Studio
                </Link>
              </li>
              <li>
                <Link href="/dashboard/posts" className="hover:text-ink-900 transition-colors">
                  Manage Manuscripts
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-ink-900 transition-colors">
                  Staff Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Colophon & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-ink-400 gap-4">
          <p>© {new Date().getFullYear()} Chronicle Journal. Typeset in Newsreader & Plus Jakarta Sans.</p>
          <div className="flex items-center gap-4">
            <span>Handcrafted Full-Stack MERN Architecture</span>
            <span>•</span>
            <span>Independent & Ad-Free</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
