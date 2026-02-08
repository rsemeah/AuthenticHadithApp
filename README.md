# AuthenticHadithApp

📱 **React Native mobile app** (in development) + 🌐 **Production web platform** (live at [authentichadith.app](https://authentichadith.app))

## Overview

This repository contains two applications sharing a unified Supabase backend:

- **Mobile App** (`authentichadithapp/`) — React Native with Expo SDK 54, early-stage development
- **Web App** (`external/v0-authentic-hadith/`) — Next.js 16, production-ready and fully deployed
- **Shared Backend** — Supabase PostgreSQL with 36,000+ verified hadiths across 6 major collections

---

## 🌐 Web Application (Production Ready)

**Live at:** [https://authentichadith.app](https://authentichadith.app)

A full-featured Islamic learning platform with:

- 📚 **6 Major Hadith Collections** — Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasa'i, Ibn Majah
- 🤖 **AI Scholar Assistant** — Powered by Groq/Llama 3.3 70B for hadith explanations
- 🔍 **Advanced Search** — Full-text search across all 36,000+ hadiths
- 📖 **Learning Paths** — Structured curriculum from beginner to scholar
- 💾 **Bookmarks & Profiles** — Save favorites, track progress, customize experience
- 💳 **Stripe Integration** — Subscription payments with customer portal
- 🌙 **Daily Hadith** — Featured tradition on home page

### Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase PostgreSQL with Row Level Security
- **Authentication:** Supabase Auth (Email, Magic Link)
- **Payments:** Stripe Embedded Checkout + Webhooks
- **AI:** Groq API with Llama 3.3 70B Versatile
- **Styling:** Tailwind CSS 4
- **Hosting:** Vercel Edge Network
- **Analytics:** Vercel Analytics

### Database Setup

Complete SQL migrations available in `external/v0-authentic-hadith/scripts/`:

1. `001-create-profiles-table.sql` — User profiles with Stripe integration
2. `002-create-user-preferences-table.sql` — Settings and preferences
3. `003-create-hadiths-tables.sql` — Core hadith content tables
4. `004-seed-sample-hadiths.sql` — Initial sample data
5. `005-create-collections-tables.sql` — Collections, books, chapters
6. `006-seed-collections-data.sql` — Collection metadata
7. `007-seed-tirmidhi-book1-hadiths.sql` — Tirmidhi Book 1 data
8. `008-seed-tirmidhi-remaining-hadiths.sql` — Complete Tirmidhi collection
9. `009-create-subscriptions-table.sql` — Stripe subscriptions tracking
10. `010-create-stripe-events-table.sql` — Webhook deduplication
11. `create-avatars-bucket.sql` — Storage bucket for user avatars
12. `seed-real-hadiths.sql` — **44KB of real hadith data**
13. `seed-trigger.sql` — Database triggers and functions

### Web App Setup

```sh
cd external/v0-authentic-hadith
npm install

# Configure environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - GROQ_API_KEY

# Run SQL migrations in Supabase SQL Editor (001-010 in order)

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## 📱 Mobile Application (In Development)

Cross-platform mobile app built with React Native and Expo, designed to integrate with the existing Supabase backend.

### Current Status

- ✅ Expo SDK 54 starter template
- ✅ File-based routing with Expo Router
- ✅ Dark mode support
- ✅ Themed UI components
- ✅ Haptic feedback
- ⏳ Supabase integration (planned)
- ⏳ Hadith browsing (planned)
- ⏳ Offline-first architecture (planned)

### Planned Features

- 📚 Access to all 36,000+ hadiths from shared backend
- 🌐 Bilingual Arabic/English with RTL support
- 📥 Offline-first with local caching
- 📤 Native sharing & QR code generation
- 🔔 Push notifications for daily hadiths
- 💎 Premium subscriptions via in-app purchases
- 🔖 Sync bookmarks with web app

### Tech Stack

- **Framework:** React Native 0.81.5
- **Platform:** Expo SDK 54
- **Language:** TypeScript 5.9
- **Navigation:** Expo Router 6.0
- **UI:** React Native Reanimated, Gesture Handler
- **Icons:** Expo Vector Icons

### Mobile App Setup

```sh
cd authentichadithapp
npm install

# Start development server
npm start

# Run on specific platforms
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

### iOS Deployment

Automated builds via GitHub Actions:
- Pushes to `main` trigger EAS builds
- Builds submitted to TestFlight
- Configure secrets: `EXPO_TOKEN`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY`

---

## 📁 Project Structure

```
AuthenticHadithApp/
├── authentichadithapp/           # 📱 Mobile app (React Native/Expo)
│   ├── app/                      # File-based routing
│   ├── components/               # Themed UI components
│   ├── constants/                # Colors, tokens
│   └── package.json              # Expo SDK 54, React Native 0.81.5
├── app/                          # EAS build configuration
├── external/
│   └── v0-authentic-hadith/      # ✨ Production web app (Next.js 16)
│       ├── app/                  # Next.js App Router
│       │   ├── (pages)/          # Route groups (home, collections, search, etc.)
│       │   └── api/              # API routes (chat, checkout, webhooks)
│       ├── components/           # React components (UI, home, collections)
│       ├── lib/                  # Utilities (Supabase, Stripe, subscriptions)
│       ├── scripts/              # 🗄️ 13 SQL migration files
│       │   ├── 001-create-profiles-table.sql
│       │   ├── 002-create-user-preferences-table.sql
│       │   ├── 003-create-hadiths-tables.sql
│       │   ├── 004-seed-sample-hadiths.sql
│       │   ├── 005-create-collections-tables.sql
│       │   ├── 006-seed-collections-data.sql
│       │   ├── 007-seed-tirmidhi-book1-hadiths.sql
│       │   ├── 008-seed-tirmidhi-remaining-hadiths.sql
│       │   ├── 009-create-subscriptions-table.sql
│       │   ├── 010-create-stripe-events-table.sql
│       │   ├── create-avatars-bucket.sql
│       │   ├── seed-real-hadiths.sql (44KB)
│       │   └── seed-trigger.sql
│       └── package.json          # Next.js 16, Supabase, Stripe, Groq
├── .github/workflows/            # CI/CD for iOS builds
└── README.md                     # This file
```

---

## 🔗 Related Repository

The web application is also maintained in a separate repository:
**[github.com/rsemeah/v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith)**

Changes to the web app can be contributed to either repository. The `external/v0-authentic-hadith/` folder is synchronized with the standalone repo.

---

## 📋 Prerequisites

### For Web App
- Node.js 20+
- npm or pnpm
- Supabase project
- Stripe account (test mode)
- Groq API key

### For Mobile App
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS: macOS with Xcode
- Android: Android Studio

---

## 🎯 Development Status

| Component | Status | Description |
|-----------|--------|-------------|
| **Web App** | ✅ **Production** | Live at authentichadith.app, fully functional |
| **Supabase Backend** | ✅ **Production** | 36K+ hadiths, user profiles, subscriptions |
| **Mobile App** | 🚧 **Early Development** | Starter template, integration in progress |

---

## 📄 License

Copyright © 2026 AuthenticHadithApp

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

**Built with ☪️ for seekers of authentic knowledge.**