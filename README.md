# Authentic Hadith

> **A premium Islamic learning platform** for exploring, studying, and sharing 36,246 verified hadith narrations across 8 major collections — in Arabic and English.

**Native app (this repo)** + **Web app** ([v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith)) + **Shared Supabase backend**

---

## Live Platforms

| Platform | Repo | Stack | Status |
|----------|------|-------|--------|
| **iOS / Android** (Expo Go) | **This repo** | Expo SDK 54, React Native 0.81, TypeScript | Ready to run |
| **TestFlight / App Store** | **This repo** | EAS Build configured | EAS login required |
| **Web** | [v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith) | Next.js 16, Tailwind, Radix UI | [v0-authentic-hadith.vercel.app](https://v0-authentic-hadith.vercel.app) |

Both platforms share the same **Supabase project** and `hadith` table (36,246 rows, 8 collections).

---

## Features

### Core Experience (6-Tab Native App)

| Tab | What it does |
|-----|-------------|
| **Home** | Random "Hadith of the Moment" with Arabic + English. Pull to refresh. |
| **Collections** | Browse all 8 collections as tappable cards with hadith counts. |
| **Search** | Free-text search across Arabic and English. Filter by collection. |
| **Learn** | Structured learning paths with progress tracking — Foundations, Daily Practice, Character & Conduct, Scholars' Deep Dive. |
| **Assistant** | TruthSerum v1 — retrieval-first chat that searches Supabase, returns templated responses with source cards. No external LLM. |
| **Profile** | Auth-aware profile with sign in/out, premium badge, referral code, invite friends, app info. |

### Authentication System

| Screen | Description |
|--------|-------------|
| **Login** | Email + password, "Continue as Guest" option |
| **Signup** | Display name + email + password, verification email flow |
| **Forgot Password** | Email-based password reset via Supabase Auth |

Guest mode is fully functional — auth is optional but required for progress tracking, referrals, and premium features.

### Learning Paths

| Path | Difficulty | Lessons |
|------|-----------|---------|
| Foundations of Faith | Beginner | 12 |
| Daily Practice | Intermediate | 15 |
| Character & Conduct | Advanced | 18 |
| Scholars' Deep Dive | Scholar | 20 |

Each lesson includes teaching text, related hadith from the database, and "Mark as Complete" progress tracking.

### Sharing System

| Component | Description |
|-----------|-------------|
| **ShareButton** | Appears on every HadithCard and in the detail screen header |
| **ShareSheet** | Bottom sheet with hadith preview, "Share Privately" (primary), "Copy Text", "More..." |
| **Invite Friends** | Profile screen button for app invitations |
| **Referral QR Code** | Auto-generated `AH-XXXXXX` code with QR, shareable via native Share API |

Shared text includes Arabic text, English translation, source chain, and deep link (`authentichadith://hadith/{id}`).

### Promo Codes & Premium

| Feature | Description |
|---------|-------------|
| **Redeem Code** | Enter a promo code to unlock premium days |
| **My Referral Code** | QR code + share button, tracks redemptions (max 5 per code) |
| **Premium Model** | `premium_until` timestamp on profile — stackable with multiple codes |
| **Atomic Redemption** | Server-side `redeem_promo_code()` function prevents double-redemption |

### Deep Linking

| Link | Behavior |
|------|----------|
| `authentichadith://hadith/{id}` | Opens hadith detail screen |
| `authentichadith://redeem?code=XXX` | Opens redeem screen with code pre-filled |

---

## Architecture

```
AuthenticHadithApp/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout with AuthProvider
│   ├── +not-found.tsx                # 404 fallback for broken deep links
│   ├── (tabs)/                       # Bottom tab bar (6 tabs)
│   │   ├── _layout.tsx               # Tab configuration
│   │   ├── index.tsx                 # Home — random hadith
│   │   ├── collections.tsx           # Collections browser
│   │   ├── search.tsx                # Text search with filters
│   │   ├── learn.tsx                 # Learning paths list
│   │   ├── assistant.tsx             # TruthSerum chat
│   │   └── profile.tsx               # Auth-aware profile
│   ├── auth/                         # Auth screens (modal presentation)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── hadith/[id].tsx               # Hadith detail + share header button
│   ├── learn/
│   │   ├── [pathId].tsx              # Lesson list for a path
│   │   └── lesson/[lessonId].tsx     # Lesson detail + mark complete
│   └── redeem/
│       ├── index.tsx                 # Redeem a promo code
│       └── my-code.tsx               # Personal referral QR code
├── components/
│   ├── HadithCard.tsx                # Shared card (Arabic RTL + English + metadata + share)
│   ├── ShareButton.tsx               # Reusable share icon (subtle/filled variants)
│   └── ShareSheet.tsx                # Bottom sheet with preview + share actions
├── lib/
│   ├── auth.tsx                      # AuthProvider, useAuth hook, profile management
│   ├── supabase.ts                   # Supabase client (AsyncStorage)
│   ├── share.ts                      # Share utilities (format text, native Share API)
│   ├── colors.ts                     # Theme (green/gold Islamic palette)
│   └── queries.ts                    # HADITH_COLUMNS constant
├── supabase/
│   ├── migrations/
│   │   └── 20260208000000_full_sharing_system.sql   # All tables + RLS + triggers
│   └── functions/
│       └── send-inactive-reminder/index.ts          # 14-day inactivity email (Deno)
├── assets/                           # Icons, splash screen
├── eas.json                          # EAS Build profiles (dev/preview/production)
├── app.json                          # Expo config (scheme, bundle IDs, plugins)
├── .env.example                      # Environment template
└── package.json
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Expo SDK | 54 |
| UI | React Native | 0.81.5 |
| Routing | Expo Router | 6 (file-based) |
| Icons | @expo/vector-icons (Ionicons) | 15 |
| Database | Supabase (PostgreSQL) | JS client 2.95 |
| Auth | Supabase Auth | via AuthProvider context |
| QR Codes | react-native-qrcode-svg | + react-native-svg |
| Language | TypeScript | strict mode |
| Build | EAS Build | dev / preview / production profiles |

---

## Database Schema

**Supabase project:** `lwklogxdpjnvfxrlcnca`

### `hadith` table (36,246 rows)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `collection_name` | text | e.g. "Sahih al-Bukhari" |
| `arabic_text` | text | Arabic hadith (rendered RTL) |
| `english_text` | text | English translation |
| `grading` | text | e.g. "Sahih" (color-coded green/yellow/red) |
| `reference` | text | e.g. "Bukhari 1" |
| `narrator` | text | e.g. "Umar ibn al-Khattab" |
| `book` | text | Book name within collection |
| `chapter` | text | Chapter name |
| `hadith_number` | int | Hadith number |
| `book_number` | int | Book number |
| `tsv` | tsvector | Full-text search (available, not yet used) |

### Auth & Feature Tables (via migration SQL)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles — display name, email, `premium_until`, `last_seen_at`, `email_opt_in` |
| `learning_paths` | 4 structured paths (beginner → scholar) |
| `lessons` | Individual lessons with teaching text |
| `path_lessons` | Path ↔ lesson join (ordered) |
| `lesson_hadith` | Lesson ↔ hadith join (ordered) |
| `user_lesson_progress` | Per-user completion tracking |
| `promo_codes` | Referral / friends & family / campaign codes |
| `redemptions` | Code redemption log (prevents duplicates) |

All tables have **Row Level Security (RLS)** enabled. A `handle_new_user()` trigger auto-creates profiles on signup.

### Collections

| Collection | Count |
|-----------|-------|
| Sahih al-Bukhari | ~7,000+ |
| Sahih Muslim | ~7,000+ |
| Sunan Abu Dawud | ~5,000+ |
| Jami' at-Tirmidhi | ~3,900+ |
| Sunan an-Nasa'i | ~5,700+ |
| Sunan Ibn Majah | ~4,300+ |
| Muwatta Malik | ~1,800+ |
| Legacy Hadith | seed data |

---

## Setup

### Prerequisites

- **Node.js** 18+
- **Expo Go** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Quick Start

```bash
git clone https://github.com/rsemeah/AuthenticHadithApp.git
cd AuthenticHadithApp
npm install --legacy-peer-deps
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npx expo start
# Scan QR with Expo Go
```

### Supabase Setup (for auth + learning paths + promo codes)

1. Run the migration in Supabase SQL Editor:
   ```
   supabase/migrations/20260208000000_full_sharing_system.sql
   ```
2. Enable Email auth in Authentication → Settings
3. (Optional) Configure Custom SMTP for branded emails from `AuthenticHadith.App`

### TestFlight / App Store

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
eas submit --platform ios
```

Bundle identifiers are pre-configured:
- iOS: `com.redlantern.authentichadith`
- Android: `com.redlantern.authentichadith`

### Edge Function: 14-Day Inactive Reminder

```bash
supabase functions deploy send-inactive-reminder
supabase secrets set RESEND_API_KEY=re_xxxxx FROM_EMAIL=salaam@authentichadith.app
# Schedule daily at 2pm UTC in Dashboard → Edge Functions → Schedule
```

---

## Related Repository

| Repo | Description |
|------|-------------|
| [v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith) | **Web companion app** — Next.js 16 + Tailwind + Radix UI + Groq AI. Deployed on Vercel. Includes collections browser (slug-based routing), AI chat assistant (Groq SDK), Stripe pricing page, onboarding flow, admin seed tools, and an `expo-wrapper/` directory (WebView-based, Expo 52). Both apps share the same Supabase project. |

### Key differences

| Aspect | This repo (native) | v0-authentic-hadith (web) |
|--------|-------------------|--------------------------|
| Rendering | React Native (native views) | Next.js (HTML/CSS) |
| AI Assistant | TruthSerum v1 (retrieval-only, no LLM) | Groq-powered chat |
| Auth | Supabase Auth (client-side) | Supabase SSR auth |
| Routing | Expo Router (file-based) | Next.js App Router |
| Payments | Not yet | Stripe integration |
| Deployment | Expo Go / EAS Build | Vercel |

---

## Scripts

| Command | What it does |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run web` | Start in web mode |
| `npm run android` | Target Android |
| `npm run ios` | Target iOS simulator |

## License

Private repository.
