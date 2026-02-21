# Authentic Hadith — Mobile App + Web Platform

> A cross-platform Islamic hadith application — React Native mobile app with a Next.js web platform — providing access to 36,000+ authenticated hadiths from 8 major collections.

---

## Overview

**Authentic Hadith** is a full-stack Islamic education platform. This monorepo contains:

| Directory | What It Is |
|---|---|
| **`authentichadithapp/`** | React Native / Expo mobile app (iOS + Android) |
| **`external/v0-authentic-hadith/`** | Next.js web platform (mirrored from v0.dev) |

Both apps share the same **Supabase backend** and **hadith dataset**, but each has platform-specific features, payments, and UX patterns.

### Related Repository

| Repository | Purpose |
|---|---|
| **[AuthenticHadithApp](https://github.com/rsemeah/AuthenticHadithApp)** (this repo) | Mobile app + web platform mirror |
| **[v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith)** | The v0.dev source of truth for the web platform |

> The web code in `external/v0-authentic-hadith/` is kept in sync with the standalone [v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith) repo, which is the canonical source built in v0.dev.

---

## What's Been Built — Full Platform

### Hadith Content (Shared)
- **8 major hadith collections** — Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah, Muwatta Malik, Musnad Ahmad
- **36,246 authenticated hadiths** with full Arabic + English text
- **Authentication grades** — Sahih, Hasan, Da'if per hadith
- **Narrator chains** and source references
- **Hierarchical browsing** — Collection > Book > Chapter > Hadith

### AI Assistant (Shared)
- **Groq Llama 3.3 70B** with streaming responses via Vercel AI SDK
- Islamic scholar context with personalized responses
- Available on both platforms (premium-gated on mobile, quota-managed on web)

### Learning (Shared)
- **Learning paths** — Beginner, Intermediate, Advanced, Scholar levels
- Structured lessons with related hadiths and progress tracking

---

## What's Different: Mobile vs Web

### Mobile App (`authentichadithapp/`)

| Feature | Details |
|---|---|
| **Offline mode** | SQLite caching of viewed hadiths, folders, and saves — works fully offline with background sync |
| **TruthSerum v2 search** | Smart search with synonym expansion across 35 Islamic topics (Prayer, Fasting, Charity, etc.) |
| **Folder system** | Create custom folders with emojis, colors, and privacy settings (Public / Private / Unlisted) |
| **Collaboration** | Share folders with roles — Viewer, Contributor, Editor — with comments and mentions |
| **RevenueCat payments** | In-app purchases for iOS and Android via RevenueCat SDK |
| **Promo codes** | Referral codes and campaign codes with QR generation for premium access |
| **Push notifications** | Daily hadith reminders via Expo Notifications |
| **Guest mode** | Browse without creating an account |
| **Secure storage** | Auth tokens stored in Expo SecureStore |
| **6-tab navigation** | Home, Search, Collections, Learn, Assistant, My Hadith |

### Web Platform (`external/v0-authentic-hadith/`)

| Feature | Details |
|---|---|
| **Stories** | Prophet and Companion narrative content with dedicated pages |
| **Sunnah practices** | Daily sunnah actions with source references |
| **Daily Hadith page** | Dedicated `/today` route with reflection prompts and sunnah of the day |
| **Knowledge quizzes** | General and AI-generated quizzes — narrator, collection, grade, completion questions |
| **Gamification** | XP system, achievements, badges, streaks, and leaderboards |
| **Progress dashboard** | Reading statistics and engagement metrics |
| **Stripe billing** | Three tiers — Explorer (free), Premium ($9.99/mo or $49.99/yr), Lifetime ($99.99) |
| **Share links** | Token-based public hadith URLs |
| **Onboarding wizard** | Guided setup for new users |
| **v0.dev sync** | Auto-pushed from v0.app to the standalone repo and mirrored here |

### Side-by-Side Comparison

| Capability | Mobile | Web |
|---|---|---|
| **Browse collections** | Tab-based | Sidebar + pages |
| **Search** | TruthSerum v2 (35-topic synonyms) | Advanced filters (keyword, narrator, topic, number) |
| **AI assistant** | Premium only | Quota-based (free: 3/day) |
| **Save hadiths** | Folders with emojis, colors, notes, tags | Bookmarks + saved collections |
| **Collaboration** | Folder sharing with roles + comments | Share via token links |
| **Offline** | Full SQLite caching + sync | Online only |
| **Payments** | RevenueCat (in-app purchase) | Stripe (web checkout) |
| **Gamification** | -- | XP, achievements, streaks, leaderboard |
| **Quizzes** | -- | General + AI-generated |
| **Stories & Sunnah** | -- | Prophet stories, companion stories, daily sunnah |
| **Notifications** | Push notifications | -- |
| **Dark mode** | System theme | Toggle-based |

---

## Tech Stack

### Mobile App

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.81.5 |
| **Build** | Expo SDK 54 |
| **Routing** | Expo Router 6 (file-based) |
| **Language** | TypeScript (strict) |
| **Backend** | Supabase 2.39 |
| **Auth** | Supabase Auth + Expo SecureStore |
| **Offline** | SQLite (expo-sqlite) |
| **State** | TanStack React Query 5.17 |
| **Payments** | RevenueCat |
| **Notifications** | Expo Notifications |
| **AI** | Groq Llama 3.3 70B via Vercel AI SDK |

### Web Platform

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| **Language** | TypeScript (strict) |
| **Backend** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth (cookies) |
| **State** | TanStack React Query 5, SWR |
| **Payments** | Stripe |
| **AI** | Groq Llama 3.3 70B, Vercel AI SDK |
| **Charts** | Recharts |
| **Deployment** | Vercel |
| **Build Tool** | v0.app |

---

## Project Structure

```
AuthenticHadithApp/
│
├── authentichadithapp/              # MOBILE APP (React Native / Expo)
│   ├── app/                         # Expo Router screens
│   │   ├── _layout.tsx              # Root layout with providers
│   │   ├── (tabs)/                  # 6-tab navigation
│   │   │   ├── index.tsx            # Home — random hadith
│   │   │   ├── search.tsx           # TruthSerum v2 search
│   │   │   ├── collections.tsx      # Browse 8 collections
│   │   │   ├── learn.tsx            # Learning paths
│   │   │   ├── assistant.tsx        # AI chat (premium)
│   │   │   └── my-hadith.tsx        # Saved folders
│   │   ├── auth/                    # Login, signup, reset
│   │   ├── hadith/[id].tsx          # Hadith detail
│   │   ├── my-hadith/               # Folder management
│   │   ├── settings/                # Preferences
│   │   └── redeem/                  # Promo code entry
│   ├── components/
│   │   ├── hadith/                  # HadithCard, HadithList, GradeBadge
│   │   ├── ui/                      # Button, Card, Input, LoadingSpinner
│   │   ├── premium/                 # PaywallScreen, PremiumGate
│   │   ├── my-hadith/               # SaveHadithModal, folder UI
│   │   ├── share/                   # ShareSheet
│   │   └── common/                  # ErrorBoundary
│   ├── lib/
│   │   ├── supabase/                # Supabase client (SecureStore)
│   │   ├── auth/                    # AuthProvider + hooks
│   │   ├── search/topics.ts         # TruthSerum v2 (35 topics)
│   │   ├── offline/                 # SQLite cache + sync manager
│   │   ├── api/                     # Groq chat, folder operations
│   │   ├── premium/                 # Subscription check
│   │   ├── revenuecat/              # RevenueCat integration
│   │   ├── styles/colors.ts         # Design tokens
│   │   └── theme/                   # Theme provider
│   ├── hooks/                       # useMyHadith, usePremiumStatus, etc.
│   ├── types/                       # hadith.ts, my-hadith.ts
│   ├── supabase/migrations/         # Mobile-specific DB migrations
│   ├── app.json                     # Expo config
│   └── eas.json                     # EAS Build profiles
│
├── external/
│   └── v0-authentic-hadith/         # WEB PLATFORM (Next.js — mirror)
│       ├── app/                     # 43 App Router pages
│       │   ├── collections/         # Collection browser
│       │   ├── hadith/[id]/         # Hadith detail
│       │   ├── search/              # Advanced search
│       │   ├── today/               # Daily hadith
│       │   ├── stories/             # Prophet & companion stories
│       │   ├── sunnah/              # Sunnah practices
│       │   ├── quiz/                # Knowledge quizzes
│       │   ├── learn/               # Learning paths
│       │   ├── assistant/           # AI chatbot
│       │   ├── pricing/             # Subscription tiers
│       │   └── api/                 # 11+ API routes
│       ├── components/              # shadcn/Radix components
│       ├── lib/                     # Supabase, utils, products
│       └── supabase/migrations/     # Web DB migrations
│
└── scripts/                         # Build utilities
```

---

## Design System

Both platforms share a cohesive visual identity:

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Emerald Primary | `#1b5e43` | Brand, headers, primary actions |
| Emerald Dark | `#0a2a1f` | Dark backgrounds, depth |
| Gold Accent | `#c5a059` | Highlights, premium badges |
| Gold Light | `#e8c77d` | Hover states, emphasis |
| Marble Base | `#f8f6f2` | Background |
| Marble Vein | `#d4cfc7` | Borders, dividers |

### Typography
- **Headings** — Cinzel (web), System (mobile)
- **Body** — Geist (web), System (mobile)
- **Arabic** — System fonts with RTL support

---

## Database

Shared Supabase PostgreSQL backend with Row Level Security.

### Core Tables (Both Platforms)
- **`hadiths`** — Arabic text, English translation, grade, narrator, reference
- **`collections`** / **`books`** / **`chapters`** — Hierarchical organization
- **`profiles`** — User data, subscription info
- **`saved_hadiths`** — Bookmarks with notes, highlights, tags
- **`learning_paths`** / **`lessons`** / **`user_lesson_progress`** — Learning
- **`ai_usage`** / **`tier_quotas`** — Quota management

### Mobile-Specific Tables
- **`hadith_folders`** — Custom folders with icons, colors, privacy
- **`folder_collaborators`** — Sharing with Viewer / Contributor / Editor roles
- **`folder_comments`** — Comments with user mentions
- **`promo_codes`** / **`redemptions`** — Referral and campaign codes

### Web-Specific Tables
- **`quiz_attempts`** — Quiz history and scores
- **`user_streaks`** — Consecutive usage tracking
- **`sunnah_practices`** — Daily sunnah content
- **`stripe_events`** — Webhook idempotency

---

## Environment Variables

### Mobile App (`authentichadithapp/.env`)

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GROQ_API_KEY=
EXPO_PUBLIC_APP_ENV=development
```

### Web Platform (`external/v0-authentic-hadith/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
GROQ_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_BRONZE_PRICE_ID=
NEXT_PUBLIC_SILVER_PRICE_ID=
NEXT_PUBLIC_GOLD_PRICE_ID=
```

---

## Getting Started

### Mobile App

```bash
cd AuthenticHadithApp/authentichadithapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start Expo dev server
npx expo start

# Run on platforms
npx expo start --ios
npx expo start --android
```

### Web Platform

```bash
cd AuthenticHadithApp/external/v0-authentic-hadith

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start dev server
pnpm dev
```

### Building for Production

```bash
# Mobile — EAS Build
cd authentichadithapp
npx eas build --platform ios --profile production
npx eas build --platform android --profile production

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android

# Web — Vercel (auto-deploys from v0-authentic-hadith repo)
```

---

## iOS App Store Submission

Submit **only the mobile app** (`authentichadithapp/`) via Expo/Xcode:

- Submit: React Native / Expo iOS build from `authentichadithapp/`
- Do not submit: Next.js web app source in `external/v0-authentic-hadith/`

The web app and mobile app share APIs and data, but Apple submission artifacts must come from the native mobile build only.

---

## Architecture

```
                    ┌─────────────────────────┐
                    │       Supabase           │
                    │  PostgreSQL + Auth + RLS  │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │                               │
      ┌──────────▼──────────┐        ┌───────────▼───────────┐
      │    Mobile App        │        │    Web Platform         │
      │  React Native/Expo   │        │    Next.js 16           │
      │                      │        │                         │
      │  - SQLite offline    │        │  - Stripe payments      │
      │  - RevenueCat        │        │  - Gamification / XP    │
      │  - Push notifs       │        │  - Quizzes              │
      │  - Folder collab     │        │  - Stories & Sunnah     │
      │  - TruthSerum v2     │        │  - Share links          │
      │  - Promo codes       │        │  - v0.dev built         │
      └─────────────────────┘        └─────────────────────────┘
                                               │
                                      ┌────────▼────────┐
                                      │  Groq Llama 3.3  │
                                      │  (AI Assistant)   │
                                      └─────────────────┘
```

---

## Acknowledgments

- **Hadith Data** — [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api)
- **UI Components** — [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com)
- **AI Provider** — [Groq](https://groq.com)
- **Icons** — [Lucide](https://lucide.dev), [Expo Vector Icons](https://icons.expo.fyi)

---

*Last updated: February 2026*
