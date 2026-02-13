# AuthenticHadithApp

A comprehensive **monorepo** containing both mobile and web applications for accessing authentic Islamic hadiths.

> 🔄 **Repository Sync**: The `external/v0-authentic-hadith/` folder is kept in sync with [rsemeah/v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith). Both repositories contain the same production web application.

---

## Overview

This repository contains:
- **🌐 Web App** (`external/v0-authentic-hadith/`) — **Next.js, Production-Ready**, deployed at [authentichadith.app](https://authentichadith.app)
- **📱 Mobile App** (`authentichadithapp/`) — **React Native/Expo, Early Development Stage**
- **🗄️ Shared Backend** — **Supabase** with 36,000+ authentic hadiths from 6 major collections

Both applications share the same Supabase backend infrastructure for a unified experience across platforms.

---

## 🌐 Web Application (Production)

**Live at:** https://authentichadith.app

The web application in `external/v0-authentic-hadith/` is a fully-featured Islamic learning platform built with Next.js 16.

✅ **Features:**
- **📚 36,000+ Authentic Hadiths** — 6 major collections (Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasa'i, Ibn Majah)
- **🤖 AI Scholar Assistant** — Powered by Groq (Llama 3.3 70B) for intelligent hadith analysis
- **👤 User Authentication** — Secure login with Supabase Auth
- **💳 Premium Subscriptions** — Stripe-powered payment integration
- **📖 Personalized Learning Paths** — Structured curriculum from beginner to scholar-level
- **💾 Bookmarks and Collections** — Build your personal hadith library
- **🔍 Full-Text Search** — Instant search across all hadiths
- **🌙 Daily Hadith** — Featured hadith refreshed daily
- **🎨 Dark/Light Theme** — Customizable user interface

**Tech Stack:** Next.js 16, TypeScript, Supabase, Stripe, Groq AI, Tailwind CSS, shadcn/ui

**Database:** Complete Supabase setup with 13 SQL migration files in `external/v0-authentic-hadith/scripts/`

---

## 📱 Mobile Application (In Development)

Located in `authentichadithapp/`, the mobile app is being developed with React Native and Expo.

**Current Status:** 🚧 **Early Development** (Foundation in place)

✅ **Completed:**
- Expo SDK 54 setup
- File-based routing with Expo Router
- Basic UI scaffolding with themed components
- Dark mode support
- Haptic feedback integration

**Planned Features:**
- Supabase authentication integration
- 36,000+ hadiths browsing and search
- Daily hadith notifications
- Offline mode with SQLite caching
- Arabic text with RTL support
- Bookmarks and collections
- QR code sharing
- Premium features integration

**Tech Stack:** React Native, Expo SDK 54, TypeScript, Expo Router, Shared Supabase Backend

---

## 📊 Development Status

| Component | Status | Technology | Location |
|-----------|--------|------------|----------|
| Web App | ✅ **Production** | Next.js 16, Vercel | `external/v0-authentic-hadith/` |
| Backend Database | ✅ **Production** | Supabase PostgreSQL | Shared by both apps |
| Hadith Data | ✅ **Production** | 36,000+ hadiths seeded | Supabase database |
| Mobile App | 🚧 **Development** | Expo SDK 54 | `authentichadithapp/` |

---

## 📁 Project Structure

```
AuthenticHadithApp/
├── authentichadithapp/              # 📱 Mobile App (React Native/Expo)
│   ├── app/                         # Expo Router screens
│   │   ├── (tabs)/                  # Tab navigation
│   │   ├── _layout.tsx
│   │   └── modal.tsx
│   ├── components/                  # Mobile UI components
│   ├── constants/                   # Theme and configuration
│   ├── hooks/                       # React hooks
│   └── package.json
│
├── external/
│   └── v0-authentic-hadith/         # 🌐 Web App (Next.js) - PRODUCTION
│       ├── app/                     # Next.js 16 App Router pages
│       ├── components/              # React components
│       ├── lib/                     # Utilities, Supabase client, Stripe
│       ├── scripts/                 # 🗄️ 13 SQL migration files
│       │   ├── 001-create-profiles-table.sql
│       │   ├── 002-create-user-preferences-table.sql
│       │   ├── 003-create-hadiths-tables.sql
│       │   ├── 004-seed-sample-hadiths.sql
│       │   ├── 005-create-collections-tables.sql
│       │   ├── 006-seed-collections-data.sql
│       │   ├── 007-seed-tirmidhi-book1-hadiths.sql
│       │   ├── 008-seed-tirmidhi-remaining-hadiths.sql
│       │   ├── seed-real-hadiths.sql (36K+ hadiths)
│       │   ├── seed-trigger.sql
│       │   └── create-avatars-bucket.sql
│       ├── public/                  # Static assets
│       └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Web Application Setup

```bash
cd external/v0-authentic-hadith
pnpm install
cp .env.example .env.local
# Configure environment variables (Supabase, Stripe, Groq API keys)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the web app.

**Live Production Site:** https://authentichadith.app

### Mobile Application Setup

```bash
cd authentichadithapp
npm install
# Create .env file with Supabase configuration
npx expo start
```

Scan the QR code with Expo Go app on your iOS or Android device.

### Database Setup

Both applications share the same Supabase backend. To set up the database:

1. **Create a Supabase Project** at [supabase.com](https://supabase.com)
2. **Run SQL Migrations** in the Supabase SQL Editor in order:
   ```bash
   cd external/v0-authentic-hadith/scripts
   # Execute each file in numerical order:
   # 001-create-profiles-table.sql
   # 002-create-user-preferences-table.sql
   # 003-create-hadiths-tables.sql
   # 004-seed-sample-hadiths.sql
   # 005-create-collections-tables.sql
   # 006-seed-collections-data.sql
   # 007-seed-tirmidhi-book1-hadiths.sql
   # 008-seed-tirmidhi-remaining-hadiths.sql
   # seed-real-hadiths.sql (36K+ authentic hadiths)
   # create-avatars-bucket.sql
   # seed-trigger.sql
   ```
3. **Update Environment Variables** in both apps with your Supabase credentials

---

## 🔗 Related Repositories

- **[rsemeah/v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith)** - Standalone web app repository (synced with `external/v0-authentic-hadith/`)

The web application code exists in both repositories and is kept synchronized. Both point to the same production deployment at [authentichadith.app](https://authentichadith.app).

---

## 🚢 Deployment

### Web App → Vercel

The web application is deployed to Vercel:

```bash
cd external/v0-authentic-hadith
vercel
```

**Current Production URL:** https://authentichadith.app

### Mobile App → App Stores

Mobile deployment is planned for future releases:

```bash
cd authentichadithapp
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 📄 License

Copyright © 2026 Authentic Hadith App

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request for:
- 📱 Mobile app feature development
- 🐛 Bug fixes
- 📚 Documentation improvements
- 🕌 New hadith collections or improvements

---

*The web application is in **production** and live at [authentichadith.app](https://authentichadith.app).  
The mobile application is in **early development**.*
