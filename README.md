# Authentic Hadith App

> **Status:** Build verified (web export passes). Native screens wired to live Supabase (36,246 hadith). Ready for Expo Go testing.

A native mobile app for exploring verified hadith narrations of the Prophet Muhammad (peace be upon him), built with Expo and React Native.

## Architecture

**This is a native Expo app** — not a WebView wrapper. All screens render natively with React Native components and fetch data directly from Supabase.

```
app/
  _layout.tsx              # Root layout (Stack navigator)
  (tabs)/
    _layout.tsx            # Bottom tab bar (5 tabs)
    index.tsx              # Home — random hadith
    collections.tsx        # Collections — browse by collection
    search.tsx             # Search — text search
    assistant.tsx           # Assistant (TruthSerum) — chat UI
    profile.tsx            # Profile — guest mode, app info
  hadith/
    [id].tsx               # Hadith detail screen
components/
  HadithCard.tsx           # Shared hadith card component
lib/
  supabase.ts              # Supabase client
  colors.ts                # Theme colors
  queries.ts               # Shared query constants
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54, React Native 0.81 |
| Routing | Expo Router 6 (file-based) |
| UI | React Native core + Ionicons |
| Database | Supabase (PostgreSQL) |
| Language | TypeScript |
| State | React hooks (useState/useEffect) |

## Features

### Working now
- **Home:** Displays a random hadith with Arabic (RTL) + English text, narrator, grade badge, and "Show Another" button
- **Collections:** Lists all hadith collections (Sahih al-Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta Malik) as tappable cards with counts
- **Search:** Text search across `english_text` and `arabic_text` columns with collection filtering
- **Assistant (TruthSerum v1):** Chat interface that searches Supabase before responding. Returns templated summary + source cards. Refusal: "No authenticated hadith found in this library for that query."
- **Profile:** Guest user info, app version, database stats
- **Hadith Detail:** Full hadith view accessible from any card tap

### Not yet implemented
- User authentication (v1 is guest-only by design)
- Full-text search using `tsv` column (currently uses `ilike`)
- Push notifications
- Offline caching
- Custom app icons/splash screen
- EAS build configuration

## Database

**Supabase project:** `lwklogxdpjnvfxrlcnca`
**Table:** `hadith` — 36,246 rows

Key columns:
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `collection_name` | text | e.g. "Sahih al-Bukhari" |
| `arabic_text` | text | Arabic hadith text |
| `english_text` | text | English translation |
| `grading` | text | e.g. "Sahih", nullable |
| `reference` | text | e.g. "Bukhari 1", nullable |
| `narrator` | text | e.g. "Umar ibn al-Khattab", nullable |
| `book` | text | Book name, nullable |
| `chapter` | text | Chapter name, nullable |
| `tsv` | tsvector | Full-text search vector (not used in v1) |

## Setup

### Prerequisites
- Node.js 18+ (tested on 22.22.0)
- npm
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Install

```bash
git clone https://github.com/rsemeah/AuthenticHadithApp.git
cd AuthenticHadithApp
npm install
```

### Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://lwklogxdpjnvfxrlcnca.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Run

```bash
npx expo start
```

This will display a QR code in the terminal. Scan it with:
- **iOS:** Camera app or Expo Go
- **Android:** Expo Go app

For web preview:
```bash
npx expo start --web
```

If LAN mode doesn't connect, use tunnel mode:
```bash
npx expo start --tunnel
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase credentials missing" warning | Ensure `.env.local` exists with both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| QR code not scanning / can't connect | Try `npx expo start --tunnel` (installs `@expo/ngrok` on first use) |
| "No hadith found in the database" | Check Supabase credentials are correct and the `hadith` table has data |
| Web build fails | Run `npx expo install react-native-web react-dom` |
| Collections screen slow to load | Known: fetches all 36K rows client-side for counting. RPC optimization planned. |
