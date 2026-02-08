# Authentic Hadith

**A modern platform for exploring authenticated prophetic traditions, powered by AI.**

[![Live Site](https://img.shields.io/badge/Live-authentichadith.app-1B5E43?style=for-the-badge)](https://authentichadith.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com)

---

## Overview

Authentic Hadith is a full-stack Islamic learning platform that provides access to verified collections of prophetic traditions (hadith) with AI-powered explanations. Built for scholars, students, and curious minds seeking authentic knowledge from trusted sources.

### Key Features

- **📚 Hadith Collections** — Browse the six major collections (Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasa'i, Ibn Majah) organized by books and chapters
- **🤖 AI Scholar Assistant** — Chat with "SilentEngine," an AI trained to explain hadiths, discuss authenticity grades, and compare narrations across collections
- **🔍 Instant Search** — Full-text search across all hadiths with debounced queries and suggested terms
- **📖 Learning Paths** — Structured curriculum from beginner to scholar-level hadith sciences
- **💾 Save & Bookmark** — Build a personal library of favorite hadiths
- **🌙 Daily Hadith** — Featured hadith on the home page, refreshed daily
- **👤 User Profiles** — Customizable avatars, school of thought preferences, and learning level tracking

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Database** | Supabase PostgreSQL with Row Level Security |
| **Auth** | Supabase Auth (Email/Password, Magic Link) |
| **Payments** | Stripe Embedded Checkout + Customer Portal |
| **AI** | Groq API with Llama 3.3 70B |
| **Styling** | Tailwind CSS with custom Islamic design system |
| **Hosting** | Vercel Edge Network |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APP                             │
├─────────────────────────────────────────────────────────────────┤
│  Routes                                                         │
│  ├── /home          — Daily hadith, quick actions, recent      │
│  ├── /collections   — Browse all 6 major collections           │
│  ├── /search        — Full-text hadith search                  │
│  ├── /assistant     — AI chat (Premium)                        │
│  ├── /learn         — Structured learning paths                │
│  ├── /saved         — User's bookmarked hadiths                │
│  ├── /profile       — Account settings, avatar                 │
│  ├── /pricing       — Subscription plans                       │
│  └── /onboarding    — 3-step new user flow                     │
├─────────────────────────────────────────────────────────────────┤
│  API Routes                                                     │
│  ├── /api/chat            — AI streaming (Groq)                │
│  ├── /api/search          — Hadith search                      │
│  ├── /api/checkout        — Stripe checkout session            │
│  ├── /api/portal          — Stripe customer portal             │
│  ├── /api/webhooks/stripe — Webhook handler (deduped)          │
│  └── /api/subscription/sync — Instant plan unlock              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│  Tables (with RLS)                                              │
│  ├── profiles           — User info, stripe_customer_id        │
│  ├── user_preferences   — Language, collections, school        │
│  ├── subscriptions      — Active plans, tier, is_lifetime      │
│  ├── hadiths            — Core hadith content                  │
│  ├── collections        — Bukhari, Muslim, etc.                │
│  ├── books / chapters   — Hierarchical navigation              │
│  ├── saved_hadiths      — User bookmarks                       │
│  ├── hadith_views       — Recently viewed tracking             │
│  └── stripe_events      — Webhook deduplication                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Subscription Tiers

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Browse hadiths, search, save bookmarks |
| **Monthly Intro** | $4.99/mo | AI Assistant, learning paths, progress tracking |
| **Monthly** | $9.99/mo | Full access + offline mode |
| **Annual** | $49.99/yr | Everything + priority support (58% savings) |
| **Lifetime** | $99.99 once | All current & future features forever |

---

## Project Structure

```
app/
├── (pages)           # Route groups
│   ├── home/         # Landing page with daily hadith
│   ├── collections/  # Browse by collection/book/chapter
│   ├── search/       # Full-text search
│   ├── assistant/    # AI chat interface
│   ├── learn/        # Learning paths
│   ├── saved/        # Bookmarked hadiths
│   ├── profile/      # User settings
│   ├── pricing/      # Subscription plans
│   ├── onboarding/   # New user flow
│   └── settings/     # App preferences
├── api/              # Server routes
│   ├── chat/         # AI streaming endpoint
│   ├── checkout/     # Stripe checkout
│   ├── portal/       # Customer portal
│   ├── webhooks/     # Stripe webhooks
│   └── subscription/ # Plan sync
components/
├── home/             # Home page components
├── collections/      # Collection browser
├── onboarding/       # Onboarding steps
├── layout/           # App shell, navigation
└── ui/               # Reusable primitives
lib/
├── supabase/         # Database clients
├── stripe/           # Payment utilities
├── subscription/     # Premium gates, context
└── products.ts       # Stripe product catalog
scripts/
├── 001-010.sql       # Database migrations
└── seed-*.js         # Data seeding utilities
```

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase project
- Stripe account (test mode)
- Groq API key

### Setup

```bash
# Clone and install
git clone https://github.com/rsemeah/AuthenticHadithApp.git
cd AuthenticHadithApp/external/v0-authentic-hadith
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run migrations in Supabase SQL Editor
# Execute scripts/001 through 010 in order

# Start dev server
pnpm dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://authentichadith.app

# AI
GROQ_API_KEY=
```

---

## Deployment

### Vercel

1. Push to `integrate/v0-authentic-hadith` branch
2. Vercel auto-deploys to [authentichadith.app](https://authentichadith.app)
3. Set production environment variables in Vercel dashboard

### DNS Configuration

| Type | Name | Value |
|------|------|-------|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

### Stripe Webhook

Register webhook at `https://authentichadith.app/api/webhooks/stripe`:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Database Migrations

Run these in Supabase SQL Editor in order:

1. `001-create-profiles-table.sql` — User profiles
2. `002-create-user-preferences-table.sql` — Settings
3. `003-create-hadiths-tables.sql` — Core content
4. `004-seed-sample-hadiths.sql` — Initial data
5. `005-create-collections-tables.sql` — Books/chapters
6. `006-seed-collections-data.sql` — Collection metadata
7. `007-seed-tirmidhi-book1-hadiths.sql` — Tirmidhi data
8. `008-seed-tirmidhi-remaining-hadiths.sql` — More hadiths
9. `009-create-subscriptions-table.sql` — Stripe subscriptions
10. `010-create-stripe-events-table.sql` — Webhook deduping

---

## Design System

- **Primary Green:** `#1B5E43` (Islamic heritage)
- **Gold Accent:** `#C5A059` (Authentic tradition)
- **Marble Background:** `#F8F6F2` (Clean, scholarly)
- **Typography:** Cinzel (headings), Geist (body)

---

## License

This project is private and proprietary.

---

**Built with ☪️ for seekers of authentic knowledge.**
