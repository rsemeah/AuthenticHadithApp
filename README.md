# Authentic Hadith

**A production-ready Islamic learning platform** — 36,246 verified hadith across 8 major collections, a 65-lesson structured curriculum, an intelligent retrieval assistant, and a full sharing and referral ecosystem. Built as a native mobile app for iOS and Android.

---

## What This App Does

Authentic Hadith is a bilingual (Arabic + English) mobile application that lets Muslims explore, study, search, and share verified prophetic narrations. It combines a 36,000+ hadith database with structured learning paths, an AI-powered (no-LLM) search assistant, and a complete user lifecycle — from guest browsing through authentication, premium access, and referral sharing.

### At a Glance

- **36,246 hadith** across 8 canonical collections with full Arabic text, English translation, grading, and narrator chains
- **65 lessons** across 4 structured learning paths (Beginner to Scholar-level)
- **TruthSerum v2** — an intelligent retrieval assistant that expands queries using a 35-topic synonym engine and cascading PostgreSQL full-text search
- **20 quick-search topic chips** — one-tap access to topics like Prayer, Fasting, Marriage, Patience, Washing
- **Full authentication** with email/password, guest mode, password reset, and email verification
- **Premium model** with stackable promo codes, QR-based referral system, and atomic server-side redemption
- **Native sharing** with preview cards, deep links, copy-to-clipboard, and system share sheet
- **14 screens**, 3 reusable components, 6 library modules, 2 database migrations, 1 edge function
- **Figma design system** with complete token specs, component library, and screen-by-screen layouts

---

## Screens & Features

### 6-Tab Navigation

| Tab | Screen | Description |
|-----|--------|-------------|
| **Home** | Random hadith | "Hadith of the Moment" — displays a random hadith with full Arabic (RTL), English translation, collection name, reference, grading (color-coded), and narrator. Tap to view full detail. "Show Another" button for infinite discovery. |
| **Collections** | Grid browser | All 8 hadith collections displayed as a 2-column card grid with book icon, collection name, and hadith count. Tap any card to search within that collection. |
| **Search** | Smart search | Synonym-expanding search powered by a 35-topic engine. Cascading strategy: PostgreSQL `tsvector` full-text search, then expanded `ILIKE` with synonym terms, then original query fallback. Accepts URL params (`q`, `label`, `collection`) for deep integration with Learn tab topic chips. |
| **Learn** | Curriculum | 20 quick-search topic chips (horizontal scroll) + 4 learning path cards with difficulty badges, lesson counts, and per-user progress bars. Each path links to an ordered lesson list. |
| **Assistant** | TruthSerum v2 | Chat-style retrieval assistant. Expands every query through the topic synonym map, searches with cascading full-text + ILIKE, deduplicates results, detects the topic category, and returns a contextual response with up to 5 tappable source cards. 19 topic-specific teaching notes. No external LLM — every response is grounded in database results. Refusal when no results: *"No authenticated hadith found in this library for that query."* |
| **Profile** | User hub | Auth-aware profile with avatar, display name, email, premium badge (gold star with expiry date). Guest state shows Sign In / Create Account buttons. Authenticated state shows My Referral Code + Redeem a Code menu. Includes Invite Friends (native share), About section, and app stats (version, hadith count, languages). |

### Detail & Sub-Screens (8 additional screens)

| Screen | Route | Description |
|--------|-------|-------------|
| **Hadith Detail** | `/hadith/[id]` | Full hadith view with complete Arabic text, English translation, narrator, chapter, reference, grading. Share button in nav header triggers ShareSheet modal. |
| **Path Lessons** | `/learn/[pathId]` | Ordered lesson list for a learning path. Each lesson card shows number, title, summary, estimated read time, and completion status icon (completed/in-progress/not-started). |
| **Lesson Detail** | `/learn/lesson/[lessonId]` | Teaching text (rich prose explanation of the topic), related hadith cards pulled via `lesson_hadith` join, and "Mark as Complete" button with progress persistence. |
| **Login** | `/auth/login` | Email + password authentication with Bismillah header. Links to Signup, Forgot Password, and "Continue as Guest". Modal presentation on iOS. |
| **Signup** | `/auth/signup` | Display name (optional) + email + password. Sends verification email on success with "Check Your Email" confirmation screen. |
| **Forgot Password** | `/auth/forgot-password` | Email-based password reset via Supabase Auth. Shows "Email Sent" confirmation. |
| **Redeem Code** | `/redeem` | Enter a promo or referral code. Calls `redeem_promo_code()` RPC. Shows success (days added) or error (expired, already redeemed, max reached). Supports deep link pre-fill via `?code=XXX`. |
| **My Referral Code** | `/redeem/my-code` | Auto-generates `AH-XXXXXX` referral code. Displays QR code (react-native-qrcode-svg), code text, redeemed/remaining stats, and Share Code button. Each code grants 7 premium days, max 5 redemptions. |

### Reusable Components

| Component | Description |
|-----------|-------------|
| **HadithCard** | The core display unit — renders Arabic text (RTL, right-aligned), English translation, collection name (uppercase, green), reference number, color-coded grading badge (Sahih=green, Hasan=amber, Da'if=red), narrator (italic), chapter, and a share button. Supports truncated (4-line) and full modes. Tappable in truncated mode to navigate to detail. |
| **ShareSheet** | Bottom sheet modal with hadith preview card (Arabic + English + source line + verified badge), "Share Privately" primary CTA, "Copy Text" and "More..." secondary actions, and *"Sharing knowledge is sadaqah"* footer. |
| **ShareButton** | Minimal share icon (Ionicons `share-outline`) with configurable size and color. Used in HadithCard meta row and Hadith Detail nav header. |

---

## Intelligent Search System

The search and assistant features use a custom synonym expansion engine rather than an external LLM. This keeps the app fast, offline-capable for search logic, and free of API costs.

### How It Works

1. **Topic Map** (`lib/topics.ts`) — 35 Islamic topic categories, each with 5-17 synonyms covering English terms, Arabic transliterations, and related concepts. Examples:
   - `"washing"` expands to: wash, wudu, ablution, ghusl, bath, purification, tahara, clean, water, impurity, najasah
   - `"wives"` expands to: wife, wives, women, woman, spouse, marriage, husband, family, household, rights of wife, obedience, kindness
   - `"eating"` expands to: eat, food, meal, right hand, drink, meat, halal, haram, bismillah, manners, etiquette, table

2. **Cascading Search Strategy** — Three-tier fallback:
   - **Tier 1**: PostgreSQL `tsvector` full-text search (`textSearch()`) with all expanded terms joined by OR
   - **Tier 2**: `ILIKE` search on `english_text` and `arabic_text` with the top 4-6 expanded synonym terms
   - **Tier 3**: `ILIKE` with the original user query as a final fallback

3. **Topic Detection** — Scores the query against all 35 topic categories by matching term length. Used by the Assistant to add contextual teaching notes (e.g., *"Prayer (salah) is the second pillar of Islam and was emphasized by the Prophet as the first matter one will be questioned about on the Day of Judgment."*).

4. **Quick Topics** — 20 curated one-tap search chips with icons, used in both the Learn and Assistant screens.

---

## Learning Paths & Curriculum

Four structured paths with 65 total lessons, each containing teaching prose and real hadith linked by keyword search against the database.

### Path 1: Foundations of Faith (Beginner — 12 lessons)
The Importance of Intention, The Five Pillars of Islam, The Six Articles of Faith, Sincerity in Worship, Tawheed: The Oneness of Allah, The Quran as Guidance, Following the Sunnah, Tawbah: Repentance, The Reality of the Hereafter, Trust in Allah (Tawakkul), Brotherhood and Sisterhood in Islam, Avoiding Innovation in Religion

### Path 2: Daily Practice (Intermediate — 15 lessons)
Waking Up: Morning Adhkar, The Prayer: Preparation and Wudu, Perfecting Your Salah, The Fajr Prayer, Eating with Prophetic Etiquette, Dhikr Throughout the Day, The Sunnah Prayers (Rawatib), Dua: The Weapon of the Believer, Friday: The Best Day of the Week, Sleeping with the Sunnah, Entering and Leaving the Home, The Miswak and Personal Hygiene, Charity in Daily Life, Evening Adhkar and Reflection, The Night Prayer (Tahajjud)

### Path 3: Character & Conduct (Advanced — 18 lessons)
The Prophet's Character, Truthfulness and Honesty, Patience in Adversity, Kindness to Parents, The Rights of Spouses, Raising Children, Controlling Anger, Humility and Avoiding Arrogance, The Tongue: Guard It, Generosity and Hospitality, Justice and Fairness, Mercy and Compassion, Good Neighborly Relations, Modesty and Haya, Gratitude, Visiting the Sick, Respecting Elders and Scholars, Dealing with Enemies and Opponents

### Path 4: Scholars' Deep Dive (Scholar — 20 lessons)
Introduction to Hadith Sciences, Sahih al-Bukhari, Sahih Muslim, The Four Sunan Collections, The Science of Narrator Criticism (Jarh wa Ta'dil), Types of Hadith by Chain, Grading Hadith: Sahih Hasan Da'if, Fabricated Hadith, Hadith Qudsi, Abrogation in Hadith, Understanding Context (Asbab al-Wurud), Musnad Ahmad, The Muwatta of Imam Malik, Cross-Collection Analysis, The Role of Women in Hadith Transmission, The 40 Hadith of Imam al-Nawawi, Contemporary Hadith Scholarship, Common Misquoted Hadith, Hadith and Islamic Law (Fiqh), Preserving the Sunnah: Your Responsibility

Each lesson includes:
- **Teaching text** — 150-300 word educational prose explaining the topic with Islamic context
- **Related hadith** — Up to 5 real hadith linked by keyword search via a `_seed_lesson()` helper function
- **Mark as Complete** — Per-user progress tracking stored in `user_lesson_progress`

---

## Authentication & Premium

### Auth System
- **Supabase Auth** with email/password sign-in
- **Guest mode** — full browse, search, and assistant access without an account
- **AuthProvider** context (`lib/auth.tsx`) with `useAuth()` hook providing: `session`, `user`, `profile`, `loading`, `isPremium`, `signUp`, `signIn`, `signOut`, `resetPassword`, `refreshProfile`
- **Auto-profile creation** — `handle_new_user()` trigger creates a profile row on signup
- **`last_seen_at`** tracking — updated on every auth state change

### Premium Model
- **`premium_until`** timestamp on the `profiles` table
- **`isPremium`** computed as `premium_until > now()`
- **Stackable** — redeeming multiple codes extends the expiry
- **Visual indicator** — gold star badge on the Profile screen with expiry date

### Promo & Referral Codes
- **3 code types**: `referral` (user-generated), `friends_family`, `campaign`
- **Atomic redemption** — `redeem_promo_code(p_code text)` PostgreSQL function (`SECURITY DEFINER`) handles validation, duplicate checks, counter increment, and premium extension in a single transaction
- **Auto-generated referral codes** — `AH-XXXXXX` format with alphanumeric characters (no ambiguous O/0/I/1)
- **QR code display** — `react-native-qrcode-svg` renders a scannable code linking to `authentichadith://redeem?code=XXX`
- **Referral stats** — shows redeemed count and remaining uses per code

---

## Sharing System

| Feature | Implementation |
|---------|---------------|
| **Share text format** | Arabic text + English translation + source (collection, reference, grade) + deep link |
| **ShareButton** | On every HadithCard and in the Hadith Detail header |
| **ShareSheet** | Bottom sheet modal with preview card, Share Privately (system share API), Copy Text (clipboard), More... |
| **Invite Friends** | Profile screen button, shares app invitation message |
| **Deep links** | `authentichadith://hadith/{id}` opens hadith detail; `authentichadith://redeem?code=XXX` opens redeem screen |
| **QR referral** | Personal QR code with shareable referral link |

---

## Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Framework** | Expo SDK 54 | New Architecture enabled (`newArchEnabled: true`) |
| **UI** | React Native 0.81.5 | Native views on iOS + Android |
| **Routing** | Expo Router 6 | File-based routing with typed params |
| **State** | React 19 | Context API (`AuthProvider`) |
| **Database** | Supabase (PostgreSQL) | `supabase-js` 2.95 with `tsvector` full-text search |
| **Auth** | Supabase Auth | Email/password with `AsyncStorage` session persistence |
| **Icons** | Ionicons | Via `@expo/vector-icons` 15 |
| **QR Codes** | react-native-qrcode-svg | With react-native-svg 15 |
| **Sharing** | expo-sharing + RN Share API | Cross-platform native share |
| **Edge Functions** | Supabase Edge Functions (Deno) | Scheduled email jobs via Resend API |
| **Build** | EAS Build | 3 profiles: development, preview, production |
| **Language** | TypeScript | Strict mode, zero compile errors |

---

## Database Schema

### `hadith` table — 36,246 rows

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `collection_name` | text | e.g., "Sahih al-Bukhari" |
| `arabic_text` | text | Full Arabic hadith (rendered RTL) |
| `english_text` | text | English translation |
| `grading` | text | Authentication grade (Sahih / Hasan / Da'if) |
| `reference` | text | e.g., "Bukhari 1" |
| `narrator` | text | e.g., "Umar ibn al-Khattab" |
| `book` | text | Book name within collection |
| `chapter` | text | Chapter name |
| `hadith_number` | int | Number within book |
| `book_number` | int | Book number within collection |
| `tsv` | tsvector | PostgreSQL full-text search index |

### Collections

| Collection | Approximate Count |
|-----------|-------------------|
| Sahih al-Bukhari | 7,000+ |
| Sahih Muslim | 7,000+ |
| Sunan Abu Dawud | 5,000+ |
| Jami' at-Tirmidhi | 3,900+ |
| Sunan an-Nasa'i | 5,700+ |
| Sunan Ibn Majah | 4,300+ |
| Muwatta Malik | 1,800+ |
| Musnad Ahmad & others | Remaining |

### Feature Tables (8 tables via migration)

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles — display name, email, `premium_until`, `last_seen_at`, `email_opt_in` | Own-row only |
| `learning_paths` | 4 structured paths (beginner to scholar) | Public read |
| `lessons` | 65 individual lessons with teaching text | Public read |
| `path_lessons` | Path-to-lesson join (ordered by `sort_order`) | Public read |
| `lesson_hadith` | Lesson-to-hadith join (links lessons to real hadith) | Public read |
| `user_lesson_progress` | Per-user completion tracking (not_started / in_progress / completed) | Own-row only |
| `promo_codes` | Referral, friends & family, and campaign codes with expiry and max redemptions | Active codes only |
| `redemptions` | Code redemption log with user-code uniqueness constraint | Own-row only |

### Server Functions

| Function | Type | Description |
|----------|------|-------------|
| `handle_new_user()` | Trigger | Auto-creates profile on `auth.users` insert |
| `redeem_promo_code(p_code)` | RPC (`SECURITY DEFINER`) | Atomic redemption: validates, checks expiry + max + duplicates, records redemption, extends premium |
| `_seed_lesson()` | Migration helper | Creates lesson, links to path, attaches hadith by keyword search (dropped after seeding) |

---

## Project Structure

```
AuthenticHadithApp/
├── app/                                   # 14 screens (Expo Router)
│   ├── _layout.tsx                        # Root layout with AuthProvider wrapper
│   ├── +not-found.tsx                     # 404 fallback for broken deep links
│   ├── (tabs)/                            # 6-tab bottom navigation
│   │   ├── _layout.tsx                    # Tab bar config (icons, colors, header)
│   │   ├── index.tsx                      # Home — random hadith of the moment
│   │   ├── collections.tsx                # 2-column collection grid browser
│   │   ├── search.tsx                     # Smart search with synonym expansion
│   │   ├── learn.tsx                      # Topic chips + learning paths
│   │   ├── assistant.tsx                  # TruthSerum v2 chat assistant
│   │   └── profile.tsx                    # Auth-aware user profile
│   ├── auth/
│   │   ├── login.tsx                      # Email/password login (modal)
│   │   ├── signup.tsx                     # Account creation + email verification
│   │   └── forgot-password.tsx            # Password reset
│   ├── hadith/
│   │   └── [id].tsx                       # Hadith detail + ShareSheet
│   ├── learn/
│   │   ├── [pathId].tsx                   # Lesson list for a learning path
│   │   └── lesson/[lessonId].tsx          # Lesson detail + mark complete
│   └── redeem/
│       ├── index.tsx                      # Redeem a promo code
│       └── my-code.tsx                    # Personal QR referral code
├── components/
│   ├── HadithCard.tsx                     # Core hadith display (Arabic RTL + English + metadata)
│   ├── ShareButton.tsx                    # Reusable share icon button
│   └── ShareSheet.tsx                     # Bottom sheet with preview + share actions
├── lib/
│   ├── auth.tsx                           # AuthProvider context + useAuth() hook
│   ├── supabase.ts                        # Supabase client (AsyncStorage session)
│   ├── topics.ts                          # 35-topic synonym engine + query expansion
│   ├── share.ts                           # Share formatting + native Share API
│   ├── colors.ts                          # Design tokens (green/gold Islamic palette)
│   └── queries.ts                         # HADITH_COLUMNS select constant
├── supabase/
│   ├── migrations/
│   │   ├── 20260208000000_full_sharing_system.sql    # 8 tables, RLS, triggers, RPC
│   │   └── 20260208000001_seed_lessons.sql           # 65 lessons with hadith links
│   └── functions/
│       └── send-inactive-reminder/index.ts           # 14-day inactivity email (Deno)
├── design/
│   └── FIGMA_DESIGN_SYSTEM.md             # Complete design specs for Figma rebuild
├── eas.json                               # EAS Build (development/preview/production)
├── app.json                               # Expo config (scheme, bundle IDs, deep links)
├── tsconfig.json                          # TypeScript strict mode
└── package.json                           # 15 dependencies, 0 compile errors
```

---

## Setup

### Prerequisites

- **Node.js** 18+
- **Expo Go** on your phone — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Quick Start

```bash
git clone https://github.com/rsemeah/AuthenticHadithApp.git
cd AuthenticHadithApp
npm install --legacy-peer-deps
cp .env.example .env.local
# Edit .env.local:
#   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
npx expo start
# Scan QR with Expo Go
```

### Supabase Setup

1. **Create tables** — Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query):
   ```
   supabase/migrations/20260208000000_full_sharing_system.sql
   ```
2. **Seed lessons** — Run the second migration to populate 65 lessons:
   ```
   supabase/migrations/20260208000001_seed_lessons.sql
   ```
3. **Enable Email Auth** — Authentication > Settings > Email provider
4. **Optional: Custom SMTP** — For branded emails from `@authentichadith.app`

### TestFlight / App Store Build

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview    # Internal testing
eas build --platform ios --profile production  # App Store submission
eas submit --platform ios
```

**Bundle identifiers**: `com.redlantern.authentichadith` (iOS + Android)

### Edge Function: Inactivity Reminder

```bash
supabase functions deploy send-inactive-reminder
supabase secrets set RESEND_API_KEY=re_xxxxx FROM_EMAIL=salaam@authentichadith.app
# Schedule daily at 2pm UTC via Dashboard > Edge Functions > Schedule
```

---

## Design System

A complete Figma-ready design specification is available at [`design/FIGMA_DESIGN_SYSTEM.md`](design/FIGMA_DESIGN_SYSTEM.md), including:

- **13 color tokens** — Islamic green (#1a5e3a) + gold accent (#c9a84c) palette with semantic colors for grades, difficulty levels, and states
- **17 typography styles** — From 28px headings to 10px topic badges, with Arabic text styles (RTL, right-aligned)
- **15 component specs** — Every reusable UI element with exact measurements, variants, and interaction states
- **11 screen layouts** — Pixel-precise specifications for every screen
- **Flow map** — Complete navigation graph
- **Figma setup guide** — Page structure, frame sizes, component variants, color/text style definitions

---

## Related Repository

| Repo | Description |
|------|-------------|
| [v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith) | **Web companion** — Next.js 16 + Tailwind + Radix UI + Groq AI chat. Deployed on Vercel. Both apps share the same Supabase project. |

| Aspect | This repo (native) | v0-authentic-hadith (web) |
|--------|-------------------|--------------------------|
| Rendering | React Native (native views) | Next.js (HTML/CSS) |
| AI Assistant | TruthSerum v2 (retrieval-only, no LLM) | Groq-powered AI chat |
| Auth | Supabase Auth (client-side) | Supabase SSR Auth |
| Learning | 65-lesson structured curriculum | Not yet |
| Sharing | Native share + QR referrals | Not yet |
| Payments | Promo code model | Stripe integration |
| Deployment | Expo Go / EAS Build | Vercel |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Launch on iOS simulator |
| `npm run android` | Launch on Android emulator |
| `npm run web` | Start in web mode (Metro bundler) |

---

*Built with Expo SDK 54 + React Native 0.81 + Supabase + TypeScript. Zero compile errors. Ready for TestFlight.*
