# Authentic Hadith App

> **Status:** Build verified. Native Expo app wired to live Supabase database (36,246 hadith). Ready for Expo Go testing.

A native mobile app for exploring verified hadith narrations of the Prophet Muhammad (peace be upon him). Search, browse, and study hadith from the major authenticated collections — all in Arabic and English.

---

## Related Repositories

| Repo | What it is | Stack | Live URL |
|------|-----------|-------|----------|
| [`rsemeah/AuthenticHadithApp`](https://github.com/rsemeah/AuthenticHadithApp) | **This repo.** Native mobile app (iOS/Android/Web) | Expo SDK 54, React Native 0.81, TypeScript | Run via Expo Go |
| [`rsemeah/v0-authentic-hadith`](https://github.com/rsemeah/v0-authentic-hadith) | Web app + API + admin/seed tools + Expo WebView wrapper | Next.js 16, Tailwind, Radix UI, Groq AI SDK | [v0-authentic-hadith.vercel.app](https://v0-authentic-hadith.vercel.app) |

### How they relate

- **`v0-authentic-hadith`** is the original web app built with Next.js. It includes server-side API routes (`/api/chat`, `/api/search`, `/api/seed-*`), a full admin seed pipeline, and a basic `expo-wrapper/` directory that loads the web app inside a WebView.
- **`AuthenticHadithApp`** (this repo) is the **standalone native app** — no WebView, no Next.js dependency. It renders native React Native screens and queries Supabase directly from the client. This is the production mobile app going forward.
- Both repos share the same **Supabase project** (`lwklogxdpjnvfxrlcnca`) and the same `hadith` table (36,246 rows).

---

## Architecture

```
AuthenticHadithApp/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root Stack navigator
│   ├── (tabs)/                   # Bottom tab bar
│   │   ├── _layout.tsx           # Tab configuration (5 tabs)
│   │   ├── index.tsx             # Home — random hadith of the moment
│   │   ├── collections.tsx       # Collections — browse by collection
│   │   ├── search.tsx            # Search — text search with filters
│   │   ├── assistant.tsx         # Assistant — TruthSerum chat UI
│   │   └── profile.tsx           # Profile — guest mode, app info
│   └── hadith/
│       └── [id].tsx              # Hadith detail (full view)
├── components/
│   └── HadithCard.tsx            # Shared card (Arabic RTL + English + metadata)
├── lib/
│   ├── supabase.ts               # Supabase client (AsyncStorage auth)
│   ├── colors.ts                 # Theme constants (green/gold palette)
│   └── queries.ts                # Shared column select constants
├── assets/                       # App icons, splash screen
├── .env.example                  # Environment variable template
├── app.json                      # Expo config (scheme, splash, plugins)
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies and scripts
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Expo SDK | 54 |
| UI | React Native | 0.81.5 |
| Routing | Expo Router | 6 (file-based) |
| Icons | @expo/vector-icons (Ionicons) | 15 |
| Database | Supabase (PostgreSQL) | JS client 2.95 |
| Language | TypeScript | strict mode |
| State | React hooks | useState / useEffect |
| Web support | react-native-web | 0.21 |

## Features

### Screens

| Tab | Screen | Data source | Description |
|-----|--------|------------|-------------|
| Home | `app/(tabs)/index.tsx` | Supabase (random row) | Shows a random hadith with Arabic + English text, narrator, grade badge. "Show Another" button fetches a new one. |
| Collections | `app/(tabs)/collections.tsx` | Supabase (`collection_name` grouped) | Displays all collections as tappable cards with hadith counts. Tapping navigates to Search filtered by that collection. |
| Search | `app/(tabs)/search.tsx` | Supabase (`ilike` on `english_text` / `arabic_text`) | Free-text search with optional collection filter. Results shown as HadithCards. Tap any result to open detail view. |
| Assistant | `app/(tabs)/assistant.tsx` | Supabase (same search) | TruthSerum v1: retrieval-first chat. Searches DB, returns templated summary + up to 5 source cards. No external LLM. |
| Profile | `app/(tabs)/profile.tsx` | Static | Guest user info, app version, database stats. Auth planned for v2. |
| Detail | `app/hadith/[id].tsx` | Supabase (by UUID) | Full hadith view — complete Arabic text, English translation, narrator, chapter, grade. |

### TruthSerum Assistant (v1 — Free Mode)

The Assistant tab implements a **retrieval-first** pattern:

1. User sends a message
2. App searches Supabase using `ilike` on `english_text` and `arabic_text`
3. If results found: returns *"I found X relevant hadith in [collections]..."* with source cards
4. If no results: returns the exact refusal string:
   > "No authenticated hadith found in this library for that query."
5. Each source card shows collection, reference, grade, preview text, and an "Open" link to the detail screen

**No external LLM is called.** All responses are deterministic and template-based.

### Collections in Database

| Collection | Approximate count |
|-----------|------------------|
| Sahih al-Bukhari | ~7,000+ |
| Sahih Muslim | ~7,000+ |
| Sunan Abu Dawud | ~5,000+ |
| Jami' at-Tirmidhi | ~3,900+ |
| Sunan an-Nasa'i | ~5,700+ |
| Sunan Ibn Majah | ~4,300+ |
| Muwatta Malik | ~1,800+ |
| Legacy Hadith | seed data |

**Total: 36,246 hadith** (verified via Supabase API)

## Database Schema

**Supabase project:** `lwklogxdpjnvfxrlcnca`
**Table:** `hadith`

| Column | Type | Used in app | Notes |
|--------|------|-------------|-------|
| `id` | UUID | Yes | Primary key |
| `collection_name` | text | Yes | e.g. "Sahih al-Bukhari". Primary grouping key. |
| `arabic_text` | text | Yes | Arabic hadith text (rendered RTL) |
| `english_text` | text | Yes | English translation |
| `grading` | text | Yes | e.g. "Sahih". Color-coded: green/yellow/red. Nullable. |
| `reference` | text | Yes | e.g. "Bukhari 1". Nullable. |
| `narrator` | text | Yes | e.g. "Umar ibn al-Khattab". Nullable. |
| `book` | text | Yes | Book name within collection. Mostly null for bulk imports. |
| `chapter` | text | Yes | Chapter name. Nullable. |
| `hadith_number` | int | Yes | Nullable. |
| `book_number` | int | Yes | Nullable. |
| `collection_slug` | text | No | URL-friendly slug (e.g. "bukhari") |
| `tsv` | tsvector | No (v2) | Full-text search vector. Exists but not yet used. |
| `source` | text | No | e.g. "seed" |
| `created_at` | timestamp | No | Row creation time |
| `updated_at` | timestamp | No | Last update time |

## Setup

### Prerequisites

- **Node.js** 18+ (tested on 22.22.0)
- **npm** (comes with Node)
- **Expo Go** app on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 1. Clone and install

```bash
git clone https://github.com/rsemeah/AuthenticHadithApp.git
cd AuthenticHadithApp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://lwklogxdpjnvfxrlcnca.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

> The anon key is the **public** key from your Supabase project dashboard under Settings > API. Never commit the service role key.

### 3. Run the app

```bash
npx expo start
```

A QR code will appear in the terminal. Scan it:

- **iOS:** Open your Camera app and point at the QR code
- **Android:** Open the Expo Go app and tap "Scan QR code"

#### Alternative run modes

```bash
# Web preview (opens in browser)
npx expo start --web

# Tunnel mode (if LAN doesn't connect — e.g. different WiFi networks)
npx expo start --tunnel

# Direct platform launch
npx expo start --android
npx expo start --ios
```

## Scripts

| Command | What it does |
|---------|-------------|
| `npm start` | Starts Expo dev server (`expo start`) |
| `npm run web` | Starts Expo dev server in web mode |
| `npm run android` | Starts and targets Android device/emulator |
| `npm run ios` | Starts and targets iOS simulator (macOS only) |

## Not yet implemented

| Feature | Status | Notes |
|---------|--------|-------|
| User authentication | Planned (v2) | v1 is guest-only by design |
| Full-text search (`tsv`) | Planned | `tsv` column exists in DB; currently using `ilike` |
| Push notifications | Planned | — |
| Offline caching | Planned | All queries hit Supabase live |
| Custom app icons | Planned | Currently using default Expo placeholder icons |
| EAS Build config | Planned | No `eas.json` yet |
| Tests | Not configured | No jest/vitest setup |
| Linter | Not configured | No eslint/prettier |
| CI/CD | Not configured | No GitHub Actions |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase credentials missing" warning | Ensure `.env.local` exists with both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| QR code not scanning / can't connect | Try `npx expo start --tunnel` (installs `@expo/ngrok` on first run) |
| "No hadith found in the database" | Verify Supabase credentials are correct and the `hadith` table has data |
| Web build fails | Run `npx expo install react-native-web react-dom` |
| Collections screen slow to load | Known issue: fetches all 36K rows client-side for counting. Server-side RPC optimization planned. |
| "Network request failed" on device | Ensure phone and dev machine are on the same WiFi, or use `--tunnel` mode |

## License

Private repository.
