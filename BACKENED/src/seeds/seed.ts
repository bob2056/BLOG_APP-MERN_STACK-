import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Like } from '../models/Like';
import { Bookmark } from '../models/Bookmark';
import { Follow } from '../models/Follow';
import { hashPassword } from '../utils/password';
import { slugify } from '../utils/slugify';
import { logger } from '../utils/logger';

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');
    await connectDB();

    // Clean existing collections
    logger.info('Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Bookmark.deleteMany({}),
      Follow.deleteMany({}),
    ]);

    // 1. Create Users (1 Admin, 3 Normal Users)
    logger.info('Creating users...');
    const defaultPasswordHash = await hashPassword('Password123!');

    const adminUser = await User.create({
      name: 'System Admin',
      username: 'admin',
      email: 'admin@blogapp.com',
      password: defaultPasswordHash,
      role: 'ADMIN',
      bio: 'Lead platform administrator and chief editor.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const user1 = await User.create({
      name: 'Sarah Connor',
      username: 'sarahc',
      email: 'sarah@blogapp.com',
      password: defaultPasswordHash,
      role: 'USER',
      bio: 'Full-stack engineer passionate about TypeScript, Node.js, and React architecture.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const user2 = await User.create({
      name: 'Alex Rivera',
      username: 'alexdev',
      email: 'alex@blogapp.com',
      password: defaultPasswordHash,
      role: 'USER',
      bio: 'DevOps enthusiast, cloud architect, and open-source writer.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const user3 = await User.create({
      name: 'Elena Rostova',
      username: 'elenar',
      email: 'elena@blogapp.com',
      password: defaultPasswordHash,
      role: 'USER',
      bio: 'UI/UX specialist and frontend craftswoman focusing on Next.js and Tailwind.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80',
      isActive: true,
    });

    logger.info(`Created 4 users: ${adminUser.username}, ${user1.username}, ${user2.username}, ${user3.username}`);

    // 2. Create Categories
    logger.info('Creating categories...');
    const categoriesData = [
      {
        name: 'Technology',
        slug: slugify('Technology'),
        description: 'Explore the latest advancements in web engineering, cloud computing, and AI.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Web Development',
        slug: slugify('Web Development'),
        description: 'Deep dives into JavaScript, TypeScript, Node.js, Express, React, and Next.js.',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Database Architecture',
        slug: slugify('Database Architecture'),
        description: 'Mastering MongoDB, Mongoose schema design, indexing, and high-performance querying.',
        image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'DevOps & Security',
        slug: slugify('DevOps & Security'),
        description: 'Best practices for API security, containerization, JWT authentication, and zero-trust.',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    logger.info(`Created ${categories.length} categories.`);

    // 3. Create Posts
    logger.info('Creating sample posts...');
    const postsData = [
      {
        title: 'Building a REST API with Node.js and TypeScript',
        slug: slugify('Building a REST API with Node.js and TypeScript'),
        excerpt: 'A comprehensive guide on creating robust, production-grade RESTful APIs using Express, TypeScript, and Mongoose.',
        content: `Building scalable backend systems requires solid design patterns and type safety. In this guide, we dive deep into architecting an Express application using TypeScript.

### Key Architectural Pillars
1. **Clean Separation of Concerns**: Isolating controllers from business logic services.
2. **Schema-driven Validation**: Utilizing Zod to ensure runtime safety across request payloads.
3. **Robust Security**: Enforcing Helmet, CORS, and bcrypt hashing for credentials.

By adhering to these principles, your API remains maintainable and resilient under high traffic.`,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        author: user1._id,
        category: categories[1]._id,
        tags: ['nodejs', 'typescript', 'express', 'rest-api'],
        status: 'PUBLISHED' as const,
        views: 142,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Mastering MongoDB Indexes for Extreme Query Performance',
        slug: slugify('Mastering MongoDB Indexes for Extreme Query Performance'),
        excerpt: 'Learn how single-field, compound, and multikey indexes transform MongoDB query response times from seconds to milliseconds.',
        content: `Without proper indexing, MongoDB must perform a full collection scan (COLLSCAN) for every read operation.

### Crucial Best Practices
- Place equality fields first, followed by sort fields, and then range filters (Equality, Sort, Range - ESR rule).
- Use compound unique indexes to guarantee business constraints at the database level.
- Monitor explain plans via \`.explain("executionStats")\` to verify index hit ratios.`,
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
        author: user2._id,
        category: categories[2]._id,
        tags: ['mongodb', 'database', 'performance', 'mongoose'],
        status: 'PUBLISHED' as const,
        views: 298,
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Modern JWT Authentication and Refresh Token Strategies',
        slug: slugify('Modern JWT Authentication and Refresh Token Strategies'),
        excerpt: 'Explore stateless authentication patterns, token expiration lifecycles, and defending against token theft.',
        content: `JSON Web Tokens (JWT) are ubiquitous in modern microservices and decoupled web apps.

### Core Implementation Guidelines
- Sign tokens with strong HMAC SHA-256 or RSA keys.
- Store sensitive identifiers safely and never store unhashed passwords or raw secrets.
- Enforce short expiration periods paired with secure revocation flows.`,
        coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        author: adminUser._id,
        category: categories[3]._id,
        tags: ['jwt', 'security', 'auth', 'nodejs'],
        status: 'PUBLISHED' as const,
        views: 450,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Next.js App Router and Server Components Explained',
        slug: slugify('Next.js App Router and Server Components Explained'),
        excerpt: 'Understanding React Server Components (RSC), streaming with Suspense, and how to consume REST backends efficiently.',
        content: `The Next.js App Router introduces a paradigm shift in how we structure frontend client and server boundaries.

### Advantages
- Drastically reduced client bundle sizes.
- Direct data fetching in server components with automatic caching.
- Enhanced SEO and faster First Contentful Paint (FCP).`,
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        author: user3._id,
        category: categories[1]._id,
        tags: ['nextjs', 'react', 'frontend', 'javascript'],
        status: 'PUBLISHED' as const,
        views: 89,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Draft: Microservices vs Monoliths in 2026',
        slug: slugify('Draft: Microservices vs Monoliths in 2026'),
        excerpt: 'An objective architectural review on when to modularize and when to maintain a unified monolithic codebase.',
        content: `Draft content in progress. Analyzing operational overhead, distributed tracing, and team velocity comparisons.`,
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        author: user1._id,
        category: categories[0]._id,
        tags: ['architecture', 'microservices', 'monolith'],
        status: 'DRAFT' as const,
        views: 0,
        publishedAt: null,
      },
    ];

    const posts = await Post.insertMany(postsData);
    logger.info(`Created ${posts.length} posts.`);

    // 4. Create Comments & Replies
    logger.info('Creating comments and replies...');
    const comment1 = await Comment.create({
      content: 'Outstanding write-up! The ESR rule explanation for MongoDB compound indexes clarified so many performance bottlenecks for my team.',
      author: user1._id,
      post: posts[1]._id,
      parentComment: null,
      isEdited: false,
    });

    await Comment.create({
      content: 'Glad it helped Sarah! In the next post, I will cover partial filter expressions and TTL indexes.',
      author: user2._id,
      post: posts[1]._id,
      parentComment: comment1._id,
      isEdited: false,
    });

    await Comment.create({
      content: 'Clean architecture in Express + TypeScript is such a joy to work with. Highly recommend this approach for junior developers.',
      author: user3._id,
      post: posts[0]._id,
      parentComment: null,
      isEdited: false,
    });

    logger.info('Comments seeded successfully.');

    // 5. Create Likes
    logger.info('Creating likes...');
    await Like.create([
      { post: posts[0]._id, user: user2._id },
      { post: posts[0]._id, user: user3._id },
      { post: posts[1]._id, user: user1._id },
      { post: posts[1]._id, user: adminUser._id },
      { post: posts[2]._id, user: user1._id },
    ]);

    // 6. Create Bookmarks
    logger.info('Creating bookmarks...');
    await Bookmark.create([
      { post: posts[0]._id, user: user2._id },
      { post: posts[1]._id, user: user3._id },
      { post: posts[2]._id, user: user1._id },
    ]);

    // 7. Create Follow Relationships
    logger.info('Creating follow relationships...');
    await Follow.create([
      { follower: user1._id, following: user2._id },
      { follower: user1._id, following: adminUser._id },
      { follower: user2._id, following: user1._id },
      { follower: user3._id, following: user1._id },
    ]);

    logger.info('Database seeding completed successfully!');
    logger.info('===============================================');
    logger.info('Seed Credentials:');
    logger.info('Admin User:     admin@blogapp.com     / Password123!');
    logger.info('Normal User 1:  sarah@blogapp.com     / Password123!');
    logger.info('Normal User 2:  alex@blogapp.com      / Password123!');
    logger.info('Normal User 3:  elena@blogapp.com     / Password123!');
    logger.info('===============================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
