# Enterprise-Grade Blog Application Backend REST API

> A robust, scalable, production-ready Blog Platform Backend built with **Node.js**, **Express.js**, **TypeScript**, **MongoDB**, **Mongoose**, **JWT**, **Zod**, and **Multer**. Designed specifically to demonstrate high-level engineering practices for a **Junior MERN Stack Developer** portfolio.

---

## 🌟 Key Highlights & Engineering Features

- **Layered Clean Architecture**: Strict separation of concerns — Routes $\to$ Validation $\to$ Controllers $\to$ Services $\to$ Mongoose Models.
- **Strict TypeScript**: 100% type-safe codebase with strict null checks, request augmentation, and zero `any` shortcuts.
- **Robust Authentication & RBAC**: JWT stateless auth, role-based authorization (`USER` vs `ADMIN`), secure password hashing via `bcryptjs`, and password exclusion from API responses.
- **Bulletproof Input Validation**: Complete schema-driven validation using **Zod** for request bodies, URL params, and query strings.
- **Optimized MongoDB & Mongoose**:
  - Compound indexes to accelerate pagination, sorting, and author/category filtering.
  - Compound unique indexes to prevent duplicate likes, bookmarks, and follow actions at the database level.
  - Collision-resistant SEO slug generation (`my-post`, `my-post-1`, `my-post-2`).
  - Atomic views incrementation (`$inc: { views: 1 }`).
  - Full-text and regex search across `title`, `excerpt`, `content`, and `tags`.
  - Cascading cleanup on deletions.
- **Secure File Upload Pipeline**: Multer configuration with subdirectories (`avatars/`, `posts/`, `categories/`), crypto-randomized filenames, MIME-type verification, and double-extension attack defense.
- **Centralized Error Handling**: Standardized JSON error contract intercepting Zod errors, Mongoose CastError/Validation, Mongo duplicate key errors (11000), JWT expirations, and Multer limits.
- **Production Security Baseline**: Helmet HTTP security headers, CORS origin whitelisting, express request size limits, and Morgan structured logging.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js (v18+)** | JavaScript runtime environment |
| **Express.js** | Fast, minimalist web framework |
| **TypeScript (v5+)** | Static typing, maintainability, and DX |
| **MongoDB & Mongoose (v8+)** | NoSQL database with strict schema modeling and indexing |
| **JSON Web Tokens (JWT)** | Stateless authentication with signed tokens |
| **bcryptjs** | Adaptive salt password hashing |
| **Zod** | Declarative schema validation and type inference |
| **Multer** | Multipart/form-data middleware for image handling |
| **Helmet** | HTTP response header security hardening |
| **CORS** | Cross-Origin Resource Sharing configuration |
| **Morgan** | HTTP request logging for development and production |
| **tsx** | Ultra-fast TypeScript dev runtime and watcher |

---

## 📂 Project Architecture

```
BACKENED/
├── src/
│   ├── config/              # Configuration files
│   │   ├── env.ts           # Type-safe environment variables
│   │   └── db.ts            # Mongoose connection & lifecycle handlers
│   ├── controllers/         # Express request/response handlers
│   │   ├── admin.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── post.controller.ts
│   │   ├── search.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/         # Application & route middlewares
│   │   ├── auth.middleware.ts       # requireAuth, requireAdmin, optionalAuth
│   │   ├── error.middleware.ts      # Global centralized error handler
│   │   ├── notFound.middleware.ts   # 404 handler
│   │   ├── upload.middleware.ts     # Multer storage, filter, & limits
│   │   └── validate.middleware.ts   # Zod schema validation runner
│   ├── models/              # Mongoose database models & schemas
│   │   ├── Bookmark.ts      # User post bookmarks
│   │   ├── Category.ts      # Blog categories
│   │   ├── Comment.ts       # Threaded comments & replies
│   │   ├── Follow.ts        # Author follower/following graph
│   │   ├── Like.ts          # Post likes
│   │   ├── Post.ts          # Blog posts with text & compound indexes
│   │   └── User.ts          # Users with password masking
│   ├── routes/              # Express API routers
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── index.ts         # Main router aggregator & health check
│   │   ├── post.routes.ts
│   │   ├── search.routes.ts
│   │   └── user.routes.ts
│   ├── seeds/               # Database seeder scripts
│   │   └── seed.ts          # Creates admin, users, categories, posts & comments
│   ├── services/            # Pure business logic & database queries
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── bookmark.service.ts
│   │   ├── category.service.ts
│   │   ├── comment.service.ts
│   │   ├── follow.service.ts
│   │   ├── like.service.ts
│   │   ├── post.service.ts
│   │   ├── search.service.ts
│   │   └── user.service.ts
│   ├── types/               # TypeScript interfaces & declarations
│   │   ├── express.d.ts     # Augmented Express.Request with AuthUser
│   │   └── index.ts         # Standard API interfaces & pagination types
│   ├── utils/               # Shared helper functions
│   │   ├── apiResponse.ts   # Standard success/paginated response helpers
│   │   ├── appError.ts      # Operational error class
│   │   ├── jwt.ts           # Token sign & verify utilities
│   │   ├── logger.ts        # Application logger
│   │   ├── password.ts      # bcrypt hashing and comparison
│   │   ├── request.ts       # Express 5 param extraction
│   │   └── slugify.ts       # SEO slugification & collision avoidance
│   ├── app.ts               # Express application initialization & middleware stack
│   └── server.ts            # Server entrypoint with graceful shutdown
├── uploads/                 # Static uploads directory
│   ├── avatars/
│   ├── categories/
│   └── posts/
├── dist/                    # Compiled JavaScript (generated on build)
├── .env.example             # Template environment variables
├── .env                     # Local environment variables
├── .gitignore
├── package.json
├── postman_collection.json  # Comprehensive Postman v2.1 collection
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or copy `.env.example`):

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/blog_app_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Client Configuration (CORS)
CLIENT_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on port 27017 or a MongoDB Atlas URI

### 2. Installation
```bash
# Navigate to the BACKENED directory
cd BACKENED

# Install dependencies
npm install
```

### 3. Database Seeding
Populate your database with sample categories, posts, comments, likes, bookmarks, and users:

```bash
npm run seed
```

#### Pre-seeded User Accounts:
| Role | Email | Password | Username |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@blogapp.com` | `Password123!` | `admin` |
| **USER** | `sarah@blogapp.com` | `Password123!` | `sarahc` |
| **USER** | `alex@blogapp.com` | `Password123!` | `alexdev` |
| **USER** | `elena@blogapp.com` | `Password123!` | `elenar` |

### 4. Running the Server

#### Development Mode (with hot-reload):
```bash
npm run dev
```

#### Production Build & Run:
```bash
npm run build
npm start
```

---

## 📡 API Contract Specification

All API endpoints follow a consistent, standardized JSON contract:

### Success Response Format:
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": { ... }
}
```

### Paginated Response Format:
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response Format:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Please provide a valid email address",
    "password": "Password must be at least 6 characters"
  }
}
```

---

## 📚 Endpoints Directory

### 1. System Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Check server health, uptime, and status |

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user | `{ name, username, email, password, bio?, avatar? }` |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT | `{ email, password }` |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user | `None` (Bearer Token) |
| `PATCH`| `/api/auth/change-password` | Authenticated | Change user password | `{ currentPassword, newPassword }` |
| `POST` | `/api/auth/logout` | Public | Logout notification | `None` |

### 3. Users & Profiles (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:username` | Public | Get public profile with post, follower, and following counts |
| `PATCH`| `/api/users/me` | Authenticated | Update user name, username, bio |
| `PATCH`| `/api/users/me/avatar` | Authenticated | Upload & update profile avatar (`multipart/form-data`) |
| `GET` | `/api/users/me/bookmarks` | Authenticated | Get paginated posts saved by current user |
| `POST` | `/api/users/:userId/follow` | Authenticated | Follow another author (prevents self-follow) |
| `DELETE`| `/api/users/:userId/follow` | Authenticated | Unfollow an author |
| `GET` | `/api/users/:userId/followers` | Public | Get paginated list of user followers |
| `GET` | `/api/users/:userId/following` | Public | Get paginated list of authors followed by user |

### 4. Blog Posts (`/api/posts`)
| Method | Endpoint | Access | Description | Query / Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Get published posts with pagination & sorting | `?page=1&limit=10&sort=newest&category=...&tag=...&author=...&search=...` |
| `GET` | `/api/posts/:slug` | Public (optional auth) | Get single post by SEO slug (increments views atomically) | Returns `post`, `likeCount`, `isLiked`, `isBookmarked` |
| `GET` | `/api/posts/my-posts` | Authenticated | Get all posts created by authenticated user | `?page=1&limit=10&status=DRAFT` |
| `POST` | `/api/posts` | Authenticated | Create a new blog post | `{ title, content, excerpt?, category, tags?, status?, coverImage? }` |
| `POST` | `/api/posts/upload-cover` | Authenticated | Upload cover image file (`multipart/form-data`) | `coverImage` file input |
| `PATCH`| `/api/posts/:id` | Author / Admin | Update post details, auto-regenerating unique slug if title changed | Partial post fields |
| `DELETE`| `/api/posts/:id` | Author / Admin | Delete post and cascade delete associated comments, likes, bookmarks | `None` |

### 5. Post Likes & Bookmarks
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts/:postId/like` | Authenticated | Like a post (idempotent, prevents duplicate likes) |
| `DELETE`| `/api/posts/:postId/like` | Authenticated | Unlike a post |
| `GET` | `/api/posts/:postId/likes` | Public (optional auth) | Get like count and whether current user liked it |
| `POST` | `/api/posts/:postId/bookmark` | Authenticated | Save post to user bookmarks |
| `DELETE`| `/api/posts/:postId/bookmark` | Authenticated | Remove post from user bookmarks |

### 6. Comments & Nested Replies
| Method | Endpoint | Access | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/:postId/comments` | Public | Get paginated comments with nested replies | `?page=1&limit=10` |
| `POST` | `/api/posts/:postId/comments` | Authenticated | Post a comment or reply | `{ content, parentComment? }` |
| `PATCH`| `/api/comments/:id` | Author / Admin | Update comment content | `{ content }` |
| `DELETE`| `/api/comments/:id` | Author / Admin | Delete comment and cascade delete replies | `None` |

### 7. Categories (`/api/categories`)
| Method | Endpoint | Access | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Get all categories with article counts | `None` |
| `GET` | `/api/categories/:slug` | Public | Get category details by slug | `None` |
| `POST` | `/api/categories` | Admin Only | Create new category | `{ name, description?, image? }` |
| `POST` | `/api/categories/upload-image` | Admin Only | Upload category image | `image` file input |
| `PATCH`| `/api/categories/:id` | Admin Only | Update category | `{ name?, description?, image? }` |
| `DELETE`| `/api/categories/:id` | Admin Only | Delete category (guards if posts exist) | `None` |

### 8. Full-Text Search (`/api/search`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/search/posts?q=query` | Public | Full-text and regex search over title, excerpt, content, and tags |

### 9. Admin Dashboard (`/api/admin`)
*All admin endpoints require `requireAuth` + `requireAdmin` (`role === 'ADMIN'`).*
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Admin Only | Paginated list of users with search and role filters |
| `PATCH`| `/api/admin/users/:id/status` | Admin Only | Activate/deactivate user account |
| `DELETE`| `/api/admin/users/:id` | Admin Only | Delete user and cascade delete author data |
| `GET` | `/api/admin/posts` | Admin Only | View all posts (DRAFT, PUBLISHED, ARCHIVED) |
| `DELETE`| `/api/admin/posts/:id` | Admin Only | Moderation delete of any post |
| `GET` | `/api/admin/comments` | Admin Only | Moderation view of all platform comments |
| `DELETE`| `/api/admin/comments/:id` | Admin Only | Moderation delete of any comment |

---

## 🛡️ Security Architecture

1. **Password Protection**:
   - Salting and hashing via `bcryptjs` with factor 12.
   - User password schema configured with `select: false`.
   - Global JSON/Object transform explicitly deletes `password` and `__v`.
2. **JWT Hardening**:
   - Cryptographically signed with expiration (`7d`).
   - Token revocation verified in `requireAuth` by confirming active database status (`isActive: true`).
3. **File Upload Hardening**:
   - Whitelist validation for MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
   - Double-extension attack prevention (rejecting filenames like `evil.php.png`).
   - Disk storage uses randomized crypto hex filenames.
   - Max file size enforcement (`5MB`).
4. **Data Integrity & Concurrency**:
   - Compound unique indexes on `Like ({ user, post })`, `Bookmark ({ user, post })`, and `Follow ({ follower, following })` ensure race conditions cannot produce duplicate records.

---

## 📬 Postman Testing

A comprehensive Postman collection file is included directly in the repository: `postman_collection.json`.

### How to use:
1. Open Postman.
2. Click **Import** $\to$ select `postman_collection.json`.
3. Set your collection variables:
   - `BASE_URL`: `http://localhost:5000/api/`
   - `TOKEN`: Automatically populated upon executing the **Login (Admin)** or **Login (Normal User)** request!
4. All requests come pre-configured with headers, sample bodies, and URL query params.

---

## 💼 Why This Project Proves Junior MERN Competence

When presenting this backend in technical interviews for a **Junior MERN Developer** position, highlight these real-world architectural strengths:

1. **Not a Toy CRUD**: Unlike tutorial projects that place database queries inside Express handlers, this project implements a clean **Services / Controllers / Routes** design pattern.
2. **Schema-Driven Runtime Safety**: Utilizing **Zod** guarantees that inputs are strictly validated before hitting business logic, providing clear, structured error responses.
3. **Optimized for Frontend Consumption**: Provides rich pagination metadata (`page`, `totalPages`, `hasNextPage`), nested comment structures, and embedded like/bookmark indicators tailored for Next.js and React frontend hydration.
4. **Production Hygiene**: Includes graceful shutdown handlers (`SIGTERM`, `SIGINT`), environment isolation, Docker-ready structure, and comprehensive database seeding.
