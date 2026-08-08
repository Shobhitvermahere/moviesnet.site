# MoviesNet

> **Search Once. Find Everywhere.**

A premium content discovery search engine that searches across admin-configured websites and redirects users to the original source. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ⚠️ Legal Notice

**MoviesNet does NOT host, upload, cache, embed, mirror, or distribute copyrighted media.** The platform acts only as a content discovery engine — it searches across configured websites and redirects users to original sources.

---

## ✨ Features

- 🔍 **Unified Search** — Search across unlimited configured websites simultaneously
- ⚡ **Instant Results** — Debounced, parallel search with caching
- 🎛️ **Advanced Filters** — Filter by category, language, quality, status, and more
- 📊 **Trending** — See what's trending today, this week, and this month
- 🌐 **Website Directory** — Browse all indexed websites with health status
- 🔒 **Admin Panel** — Full dashboard with website manager, analytics, and system health
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🎨 **Premium Design** — Glassmorphism, aurora effects, micro-animations
- ♿ **Accessible** — WCAG AA compliant, keyboard navigable, screen reader friendly
- 🔐 **Secure** — JWT authentication, input validation, CORS
- 📈 **SEO Optimized** — Dynamic metadata, JSON-LD, sitemap, robots.txt

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd allsitehub-search

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Admin Panel

1. Navigate to `/admin/login`
2. Default credentials: `admin` / `allsitehub2024`
3. **First login sets your password** — use whatever password you want

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home page
│   ├── search/             # Search page
│   ├── trending/           # Trending page
│   ├── categories/[slug]/  # Category pages
│   ├── websites/           # Websites directory
│   ├── admin/              # Admin panel
│   │   ├── login/          # Admin login
│   │   ├── websites/       # Website manager
│   │   └── analytics/      # Analytics dashboard
│   └── api/                # API routes
│       ├── search/         # Search API
│       ├── websites/       # Website CRUD
│       ├── auth/           # Authentication
│       ├── trending/       # Trending data
│       ├── analytics/      # Analytics data
│       └── health/         # Health check
├── components/
│   ├── effects/            # Visual effects (aurora, particles, spotlight)
│   ├── layout/             # Header, Footer
│   └── Providers.tsx       # React Query provider
├── lib/
│   ├── search-engine.ts    # Core search engine
│   ├── db.ts               # JSON file data store
│   ├── cache.ts            # In-memory cache
│   ├── auth.ts             # JWT authentication
│   └── utils.ts            # Utility functions
├── stores/                 # Zustand state stores
├── types/                  # TypeScript types
data/                       # JSON data files
```

---

## 🔧 Adding Websites

1. Go to Admin Panel → Website Manager
2. Click "Add Website"
3. Fill in:
   - **General**: Name, URL, categories, languages
   - **Parser**: Search URL template, CSS selectors for results
   - **Advanced**: Rate limits, timeout, user agent
4. Test and save

### Parser Configuration

The search URL template uses `{query}` as a placeholder:
```
https://example.com/search?q={query}
```

For JSON/API responses, use dot notation for selectors:
```
results.items     → Container
title             → Title field
thumbnail.url     → Poster image
```

---

## 🐳 Docker Deployment

```bash
docker build -t allsitehub-search .
docker run -p 3000:3000 allsitehub-search
```

---

## 📊 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search?q=...` | No | Search across websites |
| GET | `/api/websites` | No* | List websites (limited public view) |
| POST | `/api/websites` | Admin | Create website |
| PUT | `/api/websites` | Admin | Update website |
| DELETE | `/api/websites?id=...` | Admin | Delete website |
| POST | `/api/auth` | No | Login |
| GET | `/api/auth` | Bearer | Verify token |
| GET | `/api/trending` | No | Trending searches |
| GET | `/api/analytics` | Admin | Dashboard analytics |
| GET | `/api/health` | No | System health check |

---

## 🎨 Design System

- **Background**: `#050505`
- **Surface**: `#0D0D0D`
- **Cards**: `#111111`
- **Accent**: Purple (`#8b5cf6`), Blue (`#3b82f6`), Cyan (`#06b6d4`)
- **Typography**: Inter + Geist
- **Effects**: Glassmorphism, Aurora, Floating Particles, Mouse Spotlight

---

## 📋 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `http://localhost:3000` |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `JWT_SECRET` | JWT signing secret | *(dev default)* |
| `PASSWORD_SALT` | Password hashing salt | *(dev default)* |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | *(optional)* |

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion + CSS
- **State**: Zustand + React Query
- **Auth**: JWT (jose)
- **Data**: JSON file store

---

## License

Private. All rights reserved.
