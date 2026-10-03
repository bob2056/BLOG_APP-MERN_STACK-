# Modern MERN Stack Blog Platform — Next.js 14 Frontend

A high-performance, responsive editorial blogging web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **React Hook Form**, and **Zod**.

This frontend connects directly to the Node.js + Express + MongoDB backend running at `http://localhost:5000/api` with zero mock APIs.

---

## 🌟 Key Features

### 1. Architectural Integrity & Clean Code
- **Next.js 14 App Router**: Modern directory-based routing with Server & Client components.
- **Centralized API Client (`src/lib/api.ts`)**:
  - Automatically attaches `Authorization: Bearer <token>` from local state.
  - Automatically handles FormData file uploads without overriding browser boundaries.
  - Standardized error handling mapping HTTP 400, 401, 403, 404, 409, 422, 429, and 500 status codes.
- **Domain API Services (`src/services/`)**:
  - `auth.service.ts`
  - `user.service.ts`
  - `post.service.ts`
  - `category.service.ts`
  - `comment.service.ts`
  - `like.service.ts`
  - `bookmark.service.ts`
  - `search.service.ts`
  - `admin.service.ts`
- **Global Auth Context (`src/context/AuthContext.tsx`)**:
  - Real-time authentication state with automatic token re-hydration.
  - Role verification (`ADMIN` vs `USER`).
  - Graceful token expiration handling.

---

### 2. Main Public Experience
- **Homepage (`/`)**:
  - Hero featured post spotlight.
  - Interactive category pills.
  - Latest published articles grid.
  - Trending popular posts sidebar.
  - Popular tags collection.
  - Newsletter subscribe section.
- **Articles Directory (`/blog`)**:
  - Server-synchronized search bar.
  - Filter by category & tags.
  - Sorting options: *Newest First*, *Oldest First*, *Most Viewed*.
  - Full pagination controls.
  - Skeleton loaders and empty states.
- **Article Details (`/blog/[slug]`)**:
  - Rich reading layout with metadata, reading time, view counts, and category badges.
  - Atomic views increment on every visit.
  - Optimistic **Like** button with synchronous backend sync.
  - **Bookmark** toggle button with user authentication checks.
  - Native 1-click **Share** button with clipboard feedback.
  - Interactive **Comments & Nested Replies** system (add, edit own, delete own, nested reply).
  - Author bio box with 1-click follow toggle.
  - Related articles recommendation grid.
- **Categories & Tags Archives (`/category/[slug]`, `/tag/[tag]`)**:
  - Filtered post listing with count badge and responsive layout.
- **Global Search (`/search`)**:
  - Real-time search query powered by `GET /api/search/posts?q=...`.

---

### 3. User & Admin Dashboards
- **User Dashboard (`/dashboard`)**:
  - Metrics overview: Total Posts, Published Posts, Drafts, Views, Likes, Bookmarks.
  - Recent posts table with quick actions.
- **My Posts Management (`/dashboard/posts`)**:
  - Tabbed filters: *All*, *Published*, *Drafts*, *Archived*.
  - Inline Publish / Unpublish toggles.
  - Edit and Delete post operations.
- **Rich Post Editor (`/dashboard/posts/create`, `/dashboard/posts/[id]/edit`)**:
  - Title, excerpt, and markdown/rich article textarea.
  - Direct cover image file upload with FormData preview.
  - Category selector & comma-separated tags input.
  - Publication status dropdown: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- **User Settings (`/dashboard/settings`)**:
  - Profile information update (name, username, bio).
  - Direct avatar image upload.
  - Password change form with current & new password confirmation.
- **User Profile (`/profile/[username]`)**:
  - Public profile with avatar, bio, follower count, following count.
  - Follow / Unfollow toggle button (self-follow blocked).
  - Tab of all published articles by that user.
- **Admin Dashboard (`/admin`)**:
  - Accessible only to accounts with role `ADMIN`.
  - Global metrics: Total Users, Total Posts, Total Comments, Total Categories.
  - User Moderation (`/admin/users`): Toggle active/suspended status, delete users.
  - Post Moderation (`/admin/posts`): Review and remove flagged articles.
  - Comment Moderation (`/admin/comments`): Delete spam or offensive comments.
  - Category Management (`/admin/categories`): Create and update categories.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.x or v20.x+)
- Backend running at `http://localhost:5000` (see `../BACKENED/README.md`)

### 2. Environment Setup
Create a `.env.local` file in `FRONTED/` (or copy `.env.local.example`):
```env
# Backend REST API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Backend Server Root (used for uploaded media resolution)
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Username |
|---|---|---|---|
| **Admin** | `admin@blogapp.com` | `Password123!` | `@admin` |
| **Author** | `sarah@blogapp.com` | `Password123!` | `@sarahc` |
| **Author** | `alex@blogapp.com` | `Password123!` | `@alexdev` |
| **Author** | `elena@blogapp.com` | `Password123!` | `@elenar` |

*(The Sign-in page at `/auth/login` includes a 1-click **Quick Fill Demo Credentials** widget for instant testing).*
