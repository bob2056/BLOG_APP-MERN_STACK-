# Full-Stack MERN Blog Platform

A production-grade, full-stack editorial blogging platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🏗️ Repository Architecture

This repository contains both the backend REST API and the frontend client application:

```
├── BACKENED/           # Node.js + Express + TypeScript + MongoDB REST API
│   ├── src/            # Controllers, Services, Models, Routes, Validators
│   └── postman_collection.json # Complete API collection
│
├── FRONTED/            # Next.js 14 App Router + Tailwind CSS Frontend
│   └── src/            # Pages, Components, Services, Hooks, Context
│
├── package.json        # Root scripts to orchestrate both services
└── README.md
```

---

## ⚡ Tech Stack

### Frontend (`/FRONTED`)
* **Framework**: Next.js 14 (App Router) with React 18 & TypeScript
* **Styling**: Tailwind CSS + Custom Editorial Typography (Lora + Plus Jakarta Sans)
* **Forms & Validation**: React Hook Form + Zod
* **Icons**: Lucide React
* **Architecture**: Centralized `apiClient` (`src/lib/api.ts`) with dedicated domain services

### Backend (`/BACKENED`)
* **Runtime & Framework**: Node.js, Express.js with TypeScript
* **Database & ODM**: MongoDB with Mongoose
* **Authentication**: JWT (JSON Web Tokens) & bcryptjs
* **Validation**: Zod runtime request validation
* **File Uploads**: Multer with MIME-type filtering
* **Security**: Helmet headers, strict CORS, Morgan logging

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18.x or v20.x+)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

### 2. Install Dependencies
```bash
# Install backend dependencies
cd BACKENED && npm install

# Install frontend dependencies
cd ../FRONTED && npm install
```

### 3. Environment Setup
- Copy `BACKENED/.env.example` to `BACKENED/.env`
- Copy `FRONTED/.env.local.example` to `FRONTED/.env.local`

### 4. Seed the Database
Populate realistic articles, categories, comments, and demo accounts:
```bash
cd BACKENED
npm run seed
```

### 5. Start Development Servers

**Option A — From the project root:**
```bash
# Terminal 1 (Backend - Port 5000)
npm run backend

# Terminal 2 (Frontend - Port 3000)
npm run frontend
```

**Option B — Directly in respective folders:**
```bash
# Terminal 1
cd BACKENED && npm run dev

# Terminal 2
cd FRONTED && npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Username |
|---|---|---|---|
| **Admin** | `admin@blogapp.com` | `Password123!` | `@admin` |
| **Lead Author** | `sarah@blogapp.com` | `Password123!` | `@sarahc` |
| **Author** | `alex@blogapp.com` | `Password123!` | `@alexdev` |
| **Author** | `elena@blogapp.com` | `Password123!` | `@elenar` |

*(A 1-click **Demo Fill** button is provided on the `/auth/login` page for fast testing).*

---

## 📄 License
MIT License.
