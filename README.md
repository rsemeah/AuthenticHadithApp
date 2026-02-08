# AuthenticHadithApp

A **React Native mobile application** for accessing authentic Islamic hadiths, built with Expo and React Native.

> 📱 **Status**: Native mobile app in **early development**  
> 🌐 **Related**: [**Authentic Hadith Web App**](https://authentichadith.app) — Full-featured, production-ready Next.js platform (included in `external/v0-authentic-hadith/`)

---

## Overview

This repository contains both:
- 📱 **Mobile App (React Native)** — In development, targeting iOS and Android
- 🌐 **Web App (Next.js)** — Production-ready Islamic learning platform at [authentichadith.app](https://authentichadith.app)

Both apps **share the same Supabase backend** with 36,000+ verified hadith across 8 major collections.

---

## 🌐 Web Application (Production Ready)

Location: `external/v0-authentic-hadith/`

### Features

- **📚 Hadith Collections** — Browse 6 major collections (Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasa'i, Ibn Majah)
- **🤖 AI Scholar Assistant** — Chat with "SilentEngine" powered by Groq/Llama 3.3 70B
- **🔍 Full-Text Search** — Instant search across all hadiths with debounced queries
- **📖 Learning Paths** — Structured curriculum from beginner to scholar-level
- **💾 Save & Bookmark** — Build a personal library of favorite hadiths
- **🌙 Daily Hadith** — Featured hadith refreshed daily
- **👤 User Profiles** — Custom avatars, school of thought preferences
- **💳 Premium Subscriptions** — Stripe-powered payments

### Tech Stack (Web)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Payments | Stripe |
| AI | Groq API (Llama 3.3 70B) |
| Styling | Tailwind CSS |
| Hosting | Vercel |

### Database

The web app includes **complete Supabase setup** with:

- **10+ SQL migration files** in `external/v0-authentic-hadith/scripts/`
- Tables: `hadiths`, `collections`, `books`, `chapters`, `profiles`, `user_preferences`, `saved_hadiths`, `hadith_views`
- **Row Level Security** policies
- **Full-text search** indexes
- **Storage buckets** for user avatars
- **Sample data** with real hadith from Bukhari, Muslim, Tirmidhi, etc.

---

## 📱 Mobile Application (In Development)

Location: `app/` and `authentichadithapp/`

### Current State

- ✅ Expo SDK 54 starter templates
- ✅ Basic UI scaffolding with dark mode
- ✅ Themed components (ThemedView, ThemedText, etc.)
- ✅ File-based routing with Expo Router
- ✅ Haptic feedback support
- ✅ GitHub Actions for automated iOS builds

### Planned Features

The mobile app will integrate with the existing Supabase backend to provide:

- 36,000+ verified hadith across 8 major collections
- Bilingual Arabic/English interface with RTL support
- Offline-first architecture with local caching
- Native sharing with QR referral codes
- Premium subscription model (matching web app)
- Push notifications for daily hadith
- Audio playback for Arabic recitations

### Tech Stack (Mobile)

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.81.5 |
| Platform | Expo SDK 54 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router 6.0 |
| Backend | **Shared Supabase project with web app** |
| UI | React Native Reanimated, Gesture Handler |
| Icons | Expo Vector Icons |

---

## Project Structure

```
AuthenticHadithApp/
├── app/                           # Mobile app build config
│   ├── package.json
│   ├── app.json
│   └── eas.json
│
├── authentichadithapp/            # Main mobile app (Expo starter)
│   ├── app/                       # Screens (Expo Router)
│   ├── components/                # UI components
│   ├── constants/                 # Theme & config
│   └── package.json
│
├── external/                      
│   └── v0-authentic-hadith/       # ✨ PRODUCTION WEB APP
│       ├── app/                   # Next.js 16 pages
│       ├── components/            # React components
│       ├── lib/                   # Supabase client, utils
│       ├── scripts/               # 🗄️ SQL migrations & seed data
│       │   ├── 001-create-profiles-table.sql
│       │   ├── 002-create-user-preferences-table.sql
│       │   ├── 003-create-hadiths-tables.sql
│       │   ├── 004-seed-sample-hadiths.sql
│       │   ├── 006-seed-collections-data.sql
│       │   ├── 007-seed-tirmidhi-book1-hadiths.sql
│       │   ├── 008-seed-tirmidhi-remaining-hadiths.sql
│       │   ├── seed-real-hadiths.sql
│       │   ├── seed-trigger.sql
│       │   └── create-avatars-bucket.sql
│       └── package.json
│
├── .github/workflows/             # CI/CD for iOS builds
└── scripts/                       # Build utilities
```

---

## Getting Started

### Web App (Production)

```sh
cd external/v0-authentic-hadith
npm install
cp .env.example .env.local
# Add your Supabase credentials
npm run dev
```

Visit http://localhost:3000 or see the live site at [authentichadith.app](https://authentichadith.app)

### Mobile App (Development)

```sh
cd authentichadithapp
npm install
npx expo start
```

Scan the QR code with Expo Go to run on your device.

---

## Database Setup (Shared by Both Apps)

The web app includes complete database migrations. To set up Supabase:

1. Create a new Supabase project
2. Run the SQL scripts in order from `external/v0-authentic-hadith/scripts/`
3. Update `.env.local` in both web and mobile apps with your credentials

**Supabase URL**: `https://nqklipakrfuwebkdnhwg.supabase.co` (or your own project)

---

## Deployment

### Web App → Vercel

```sh
cd external/v0-authentic-hadith
vercel
```

### Mobile App → TestFlight

```sh
cd authentichadithapp
eas build --platform ios --profile production
eas submit --platform ios
```

---

## Screenshots

> 📸 Add screenshots of both web and mobile apps here

---

## Related Repository

The web application (`external/v0-authentic-hadith/`) is also maintained separately at:  
**[github.com/rsemeah/v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith)**

Both repositories share the same Supabase backend.

---

## License

Copyright © 2026 Authentic Hadith App

## Contributing

Contributions welcome! Please open an issue or PR for:
- Mobile app feature development
- Bug fixes
- Documentation improvements
- New hadith collections

---

*The web application is **production-ready** and live at [authentichadith.app](https://authentichadith.app).  
The mobile application is in **active development**.*

Copyright © 2026 AuthenticHadithApp

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
