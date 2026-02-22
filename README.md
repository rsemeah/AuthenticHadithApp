# Authentic Hadith — Mobile App + Web Platform

> A cross-platform Islamic hadith application — Expo WebView wrapper for mobile + Next.js web platform — providing access to 36,000+ authenticated hadiths from 8 major collections.

---

## Overview

**Authentic Hadith** is a full-stack Islamic education platform. The mobile app ships as a **WebView wrapper** around the deployed Next.js web app, giving users the full feature set on day one with native in-app purchases via RevenueCat.

### Repository Layout

| Directory | What It Is |
|---|---|
| **`authentichadithapp/`** | React Native / Expo native app (future incremental native screens) |
| **`.github/workflows/`** | CI/CD for EAS Build & Submit (iOS + Android) |

### Related Repository

| Repository | Purpose |
|---|---|
| **[v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith)** | Next.js web app (source of truth) + `expo-wrapper/` (the production mobile shell) |

> **App Store builds** are produced from `v0-authentic-hadith/expo-wrapper/`. The CI workflows in this repo check out that code automatically.

---

## App Store Strategy (Option A: WebView Wrapper)

The mobile app wraps the full Next.js web app (`v0-authentic-hadith.vercel.app`) in a native Expo shell. This gives immediate feature parity with the web while adding native in-app purchases.

```
┌─────────────────────────────────┐
│  Expo Native Shell              │
│  ┌───────────────────────────┐  │
│  │  RevenueCat Provider      │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  WebView             │  │  │
│  │  │  ┌─────────────────┐ │  │  │
│  │  │  │  Next.js Web App │ │  │  │
│  │  │  │  (all features)  │ │  │  │
│  │  │  └─────────────────┘ │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**How it works:**
1. The Expo app renders a full-screen WebView pointing to the deployed web app
2. The web app detects it's inside a native shell via `window.__IS_NATIVE_APP__`
3. When the user hits a paywall, the web app calls `showNativePaywall()` from `lib/native-bridge.ts`
4. The native shell presents RevenueCat's native paywall UI
5. Purchase results are communicated back via `CustomEvent`
6. User auth is synced between Supabase (web) and RevenueCat (native)

**Why this approach:**
- Immediate feature parity — all 40+ pages, gamification, stories, quizzes, AI assistant
- Single codebase to maintain (the web app)
- Native payments satisfy Apple/Google IAP requirements
- Can incrementally replace WebView screens with native screens over time

---

## Features (Full Platform)

### Hadith Content
- **8 major collections** — Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah, Muwatta Malik, Musnad Ahmad
- **36,246 authenticated hadiths** with Arabic + English text
- **Authentication grades** — Sahih, Hasan, Da'if with color coding
- **Hierarchical browsing** — Collection > Book > Chapter > Hadith
- **Full-text search** with tag faceting

### AI & Learning
- **AI Chat Assistant** — GPT-4o-mini with hadith database search tool
- **On-demand AI summarization** — bilingual scholarly analysis per hadith
- **Structured learning paths** — Beginner to Advanced with lessons and quizzes
- **AI-generated quizzes** — narrator, collection, grade, and completion questions
- **Stories** — Sahaba companions and 25 Quranic Prophets with progress tracking
- **365 daily Sunnah practices** organized by category

### Personal & Social
- **Daily hadith** — deterministic Sahih-graded selection
- **Bookmarks & folders** — personal library with notes
- **Shareable hadith cards** — 4 themes x 3 sizes, downloadable PNG
- **Discussion threads** — comments with likes/replies on hadiths
- **Private reflection journal** — with hadith references and tags
- **Gamification** — XP, levels, achievements, streaks

### Payments
- **Web** — Stripe (Explorer free, Pro $9.99/mo or $49.99/yr, Founding $99.99 lifetime)
- **Mobile** — RevenueCat (native iOS/Android in-app purchases)
- **Quota system** — tiered daily/monthly AI limits by plan

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Web Framework** | Next.js 16 (App Router, React 19) |
| **Mobile Shell** | Expo SDK 52, React Native WebView |
| **Language** | TypeScript |
| **UI** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **AI** | OpenAI GPT-4o-mini via Vercel AI SDK |
| **Web Payments** | Stripe |
| **Mobile Payments** | RevenueCat |
| **Deployment** | Vercel (web), EAS Build (mobile) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- EAS CLI: `npm install -g eas-cli`
- Expo account: `eas login`

### Local Development

```bash
# Clone the WebView wrapper source
git clone https://github.com/rsemeah/v0-authentic-hadith.git
cd v0-authentic-hadith/expo-wrapper

# Install dependencies
npm install

# Start dev server (opens in Expo Go or dev client)
npx expo start
```

### Building for Stores

See the full submission guide at [`v0-authentic-hadith/expo-wrapper/STORE_SUBMISSION.md`](https://github.com/rsemeah/v0-authentic-hadith/blob/main/expo-wrapper/STORE_SUBMISSION.md).

```bash
cd v0-authentic-hadith/expo-wrapper

# Development build (simulator)
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## CI/CD

GitHub Actions workflows in `.github/workflows/` handle automated builds:

| Workflow | Trigger | What It Does |
|---|---|---|
| `eas-ios.yml` | Push to main / manual | Builds iOS via EAS, submits to TestFlight |
| `eas-android.yml` | Push to main / manual | Builds Android via EAS, submits to Play Store |

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `EAS_TOKEN` | Expo access token for EAS CLI |
| `REVENUECAT_API_KEY_APPLE` | Production RevenueCat Apple API key |
| `REVENUECAT_API_KEY_GOOGLE` | Production RevenueCat Google API key |
| `APPLE_API_KEY_JSON` | App Store Connect API key JSON (for iOS submission) |
| `APPLE_ID` | Apple ID email (fallback if no API key JSON) |
| `APPLE_TEAM_ID` | Apple Developer Team ID (fallback) |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY` | Google Play service account JSON (for Android submission) |

---

## Environment Variables

### Mobile Wrapper (app.json extra)

Configured in `v0-authentic-hadith/expo-wrapper/app.json`:

| Key | Description |
|---|---|
| `webAppUrl` | Deployed web app URL (`https://v0-authentic-hadith.vercel.app`) |
| `revenueCatApiKeyApple` | RevenueCat Apple API key |
| `revenueCatApiKeyGoogle` | RevenueCat Google API key |
| `revenueCatEntitlementId` | RevenueCat entitlement name (`RedLantern Studios Pro`) |

### Web Platform

See the web app's own `.env.example` in the v0-authentic-hadith repo.

---

## Acknowledgments

- **Hadith Data** — [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) and [sunnah.com](https://sunnah.com)
- **UI Components** — [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com)
- **AI** — [OpenAI](https://openai.com), [Groq](https://groq.com)
- **Icons** — [Lucide](https://lucide.dev)

---

*Last updated: February 2026*
