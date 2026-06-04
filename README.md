# PriceScraper — AI Shopping Agent

Production-grade AI-powered price comparison and shopping intelligence platform.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, Recharts, TanStack Query, Zustand
- **Backend:** Next.js API Routes, Server Actions, Node.js
- **Database:** MongoDB + Mongoose
- **AI:** OpenAI GPT-4o (extensible provider abstraction)
- **Scraping:** Playwright with anti-bot handling
- **Deployment:** Docker, Vercel, MongoDB Atlas

## Architecture

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── (main)/       # Authenticated pages group
│   └── admin/        # Admin dashboard
├── components/       # React components
│   ├── ui/           # shadcn-style primitives
│   ├── layout/       # Layout components
│   ├── search/       # Search UI
│   ├── product/      # Product display
│   ├── charts/       # Recharts components
│   └── dashboard/    # Dashboard widgets
├── lib/
│   ├── db/           # MongoDB connection + models
│   ├── scrapers/     # Store scrapers (7 stores)
│   ├── agents/       # AI agents pipeline
│   ├── ai/           # AI provider abstraction
│   ├── api/          # API utilities
│   ├── cache/        # In-memory cache
│   ├── validation/   # Zod schemas
│   └── scheduler/    # Cron jobs
├── stores/           # Zustand stores
├── hooks/            # TanStack Query hooks
└── actions/          # Server Actions
```

## Getting Started

### Prerequisites

- Node.js 22+
- MongoDB Atlas URI
- OpenAI API Key
- Playwright (for scraping)

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

Key variables:
- `MONGODB_URI` — MongoDB connection string
- `OPENAI_API_KEY` — OpenAI API key
- `AUTH_SECRET` — Session secret

### Install & Run

```bash
npm install
npx playwright install chromium
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed Stores

```bash
npx tsx scripts/seed.ts
```

## Features

- Natural language product search
- Multi-store price comparison (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, Tata Cliq, JioMart)
- AI-powered product detection and recommendation
- Price history tracking (7/30/90/180/365 day trends)
- Interactive price charts (Recharts)
- Smart alerts for price drops
- Watchlist management
- Analytics dashboard
- Dark theme (glassmorphism design)

## AI Agent Pipeline

```
User Query → Product Detection → Store Search → Price Aggregation
→ Historical Analysis → Recommendation → Response Generator
```

## Docker

```bash
docker compose up --build
```

## API Routes

| Route | Description |
|---|---|
| `GET /api/search?q=` | Full AI agent search |
| `GET /api/product/[id]` | Product details + history |
| `GET /api/compare?query=` | Price comparison |
| `GET /api/history?productId=` | Price history |
| `GET/POST/PATCH/DELETE /api/watchlist` | Watchlist CRUD |
| `GET/POST/PATCH/DELETE /api/alerts` | Alerts CRUD |
| `GET /api/recommendations?productId=` | AI recommendations |
| `GET /api/analytics?period=` | Platform analytics |
| `GET/POST /api/cron` | Scheduled tasks |
