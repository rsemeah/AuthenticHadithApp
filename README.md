# AuthenticHadithApp

A **React Native mobile application** for accessing authentic Islamic hadiths, built with Expo and React Native.

> 📱 **Status**: Native mobile app in **Currently in UAT**  
> 🌐 **Related**: [**Authentic Hadith Web App**](https://authentichadith.app) — Full-featured, production-ready Next.js platform (included in `external/v0-authentic-hadith/`)

---

# Authentic Hadith App

> A comprehensive Islamic hadith platform featuring Next.js web application and React Native mobile apps for accessing and studying authentic prophetic traditions.

---

## 🌟 Overview

The Authentic Hadith App is a full-stack application providing access to **36,246 authenticated hadiths** from 8 major Islamic collections. Built with a modern tech stack, it offers both web and mobile experiences with premium features, AI assistance, and comprehensive learning paths.

### Repository Structure

This project consists of two integrated components:

- **Web Application** (`v0-authentic-hadith`) - Next.js-based web platform
- **Mobile Application** (`AuthenticHadithApp`) - React Native/Expo mobile apps

---

## 📱 Features

### Core Features

Access to **36,246 Authentic Hadiths** from 8 major collections:

- Sahih al-Bukhari
- Sahih Muslim
- Sunan Abu Dawud
- Jami at-Tirmidhi
- Sunan an-Nasai
- Sunan Ibn Majah
- Muwatta Malik
- Musnad Ahmad

### Web Application Features

- **🔍 Advanced Search** - Category and tag filtering
- **💬 AI Assistant** - Powered by Groq Llama 3.3 70B (via Vercel AI SDK)
- **📚 Hadith Collections** - Books and chapters navigation
- **⭐ Save & Organize** - Personal notes and bookmarks
- **🎓 Learning Paths** - Structured Islamic knowledge
- **🏆 Gamification** - XP, achievements, and streaks
- **📊 User Dashboard** - Reading statistics
- **🌙 Dark Mode** - Full theme support
- **💳 Premium Subscriptions** - Stripe integration
- **🔗 Share Links** - Beautiful OG images
- **📱 Responsive Design** - Optimized for all devices

### Mobile Application Features

- **Smart Search** - TruthSerum v2 synonym expansion (35 topics)
- **Offline Mode** - SQLite caching and auto-sync
- **QR Referral Codes** - Sharing and premium access
- **Guest Mode** - Browse without account
- **Arabic RTL Support** - Proper text display
- **Push Notifications** - Daily hadith reminders
- **Folder Organization** - Custom folders and tags
- **Collaboration** - Shared folders and comments
- **i18n Support** - Multiple languages

---

## 🛠 Tech Stack

### Web Application

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS, tw-animate-css |
| **UI Components** | Radix UI, shadcn/ui |
| **AI Integration** | Groq Llama 3.3 70B, Vercel AI SDK v4 |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Payments** | Stripe |
| **Analytics** | Vercel Analytics |
| **Deployment** | Vercel |

### Mobile Application

| Category | Technologies |
|----------|-------------|
| **Framework** | React Native 0.81.5 |
| **Build System** | Expo SDK 54 |
| **Language** | TypeScript (strict mode) |
| **Routing** | Expo Router 6 (file-based) |
| **Backend** | Supabase 2.39.7 |
| **State Management** | TanStack Query 5.17 |
| **Storage** | Expo SecureStore, SQLite |
| **Features** | Expo Notifications, QR Code SVG, Sharing |

---

## 📂 Project Structure

### Web Application (`/v0-authentic-hadith`)

```
v0-authentic-hadith/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── home/                    # Dashboard & main app
│   ├── collections/             # Hadith collections
│   ├── library/                 # User's saved hadiths
│   ├── learn/                   # Learning paths
│   ├── leaderboard/             # XP leaderboard
│   ├── settings/                # User settings
│   ├── pricing/                 # Subscription plans
│   ├── login/                   # Authentication
│   ├── api/                     # API routes
│   │   ├── chat/               # AI chat endpoint
│   │   ├── search/             # Search API
│   │   └── seed/               # Database seeding
│   └── actions/                 # Server actions
│
├── components/
│   ├── layout/                  # App shell, sidebar, navigation
│   ├── home/                    # Dashboard components
│   ├── hadith/                  # Hadith cards, detail views
│   ├── assistant/               # AI chat interface
│   ├── ui/                      # Reusable UI components
│   └── share-banner.tsx         # Social sharing
│
├── lib/
│   ├── supabase/                # Supabase clients & config
│   ├── hadith-cdn-mapping.ts   # Collection metadata
│   ├── seed-helpers.ts         # Database seeding utilities
│   ├── products.ts             # Subscription products
│   └── utils.ts                # Utility functions
│
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript definitions
├── public/                      # Static assets
├── supabase/migrations/        # Database migrations
├── expo-wrapper/               # Expo wrapper for mobile
└── styles/                     # Additional styles
```

### Mobile Application (`/AuthenticHadithApp`)

```
AuthenticHadithApp/
├── authentichadithapp/          # Main mobile app
│   ├── app/                     # Expo Router screens
│   │   ├── _layout.tsx         # Root layout with providers
│   │   ├── +not-found.tsx      # 404 handler
│   │   ├── (tabs)/             # Tab navigation (6 tabs)
│   │   │   ├── index.tsx      # Home/explore
│   │   │   ├── search.tsx     # Search screen
│   │   │   ├── saved.tsx      # Saved hadiths
│   │   │   ├── learn.tsx      # Learning paths
│   │   │   ├── assistant.tsx  # AI chat
│   │   │   └── profile.tsx    # User profile
│   │   ├── auth/               # Login, signup, forgot password
│   │   ├── hadith/             # Hadith detail screen
│   │   ├── collection/         # Collection hadiths list
│   │   ├── learn/              # Learning lessons
│   │   ├── my-hadith/          # Folder management
│   │   └── redeem/             # Promo code redemption
│   │
│   ├── components/
│   │   ├── hadith/             # HadithCard, HadithList
│   │   ├── ui/                 # Button, Card, Input
│   │   ├── premium/            # PremiumGate
│   │   ├── share/              # ShareSheet
│   │   ├── common/             # ErrorBoundary
│   │   └── my-hadith/          # Folder components
│   │
│   ├── lib/
│   │   ├── supabase/           # Supabase client with SecureStore
│   │   ├── auth/               # AuthProvider, session management
│   │   ├── search/             # TruthSerum v2 topic synonyms
│   │   ├── offline/            # SQLite + sync manager
│   │   ├── api/                # API functions
│   │   │   ├── groq.ts        # AI chat API
│   │   │   └── my-hadith.ts   # Folder management API
│   │   ├── styles/             # Design tokens
│   │   ├── theme/              # Theme provider
│   │   └── premium/            # Subscription checks
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   │   ├── hadith.ts          # Hadith data types
│   │   └── my-hadith.ts       # Folder types
│   ├── constants/              # Theme constants
│   └── supabase/migrations/   # Database migrations
│
├── app/                        # Secondary app directory
├── external/                   # External dependencies
└── scripts/                    # Build scripts
```

---

## 🎨 Design System

### Color Palette (Premium SightEngine - Investor Grade A)

#### Gold Material Palette (18K Yellow Gold)

```css
--gold-shadow: #8a6e3a
--gold-mid: #c5a059
--gold-highlight: #e8c77d
--gold-specular: #fceeb5
```

#### Emerald Green Palette (Museum-quality cloisonné)

```css
--emerald-shadow: #0a2a1f
--emerald-mid: #1b5e43
--emerald-highlight: #2d7a5b
--emerald-specular: #4a9973
```

#### Marble White (Carrara marble)

```css
--marble-base: #f8f6f2
--marble-vein: #d4cfc7
--marble-vein-light: #e8e4de
--marble-shadow: #ebe7e0
```

#### Typography

- **Primary Font** - Cinzel (headings), Geist (body)
- **Monospace** - Geist Mono
- **Arabic** - System fonts with RTL support
- **Sizes** - 10-28px responsive scale

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project
- Groq API key (for AI features)
- Stripe account (for subscriptions - web only)
- Expo CLI (for mobile development)

### Environment Variables

#### Web Application (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product IDs
NEXT_PUBLIC_BRONZE_PRICE_ID=price_...
NEXT_PUBLIC_SILVER_PRICE_ID=price_...
NEXT_PUBLIC_GOLD_PRICE_ID=price_...
```

#### Mobile Application (`.env`)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Groq AI (for AI assistant)
EXPO_PUBLIC_GROQ_API_KEY=your-groq-api-key

# App Configuration
EXPO_PUBLIC_APP_NAME=Authentic Hadith
```

---

## 📦 Installation & Setup

### Web Application

```bash
# Clone the repository
git clone https://github.com/rsemeah/v0-authentic-hadith.git
cd v0-authentic-hadith

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
# Navigate to Supabase SQL Editor and run migrations from /supabase/migrations/

# Seed the database (optional - loads hadith data from CDN)
pnpm dev
# Visit http://localhost:3000/api/seed?collection=sahih-bukhari

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Mobile Application

```bash
# Clone the repository
git clone https://github.com/rsemeah/AuthenticHadithApp.git
cd AuthenticHadithApp/authentichadithapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npx expo start

# Run on specific platforms
npx expo start --ios       # iOS simulator
npx expo start --android   # Android emulator
npx expo start --web       # Web browser

# Build for production
npx eas build --platform ios      # iOS
npx eas build --platform android  # Android
```

---

## 🗄️ Database Setup

### Supabase Schema

The application uses Supabase (PostgreSQL) with the following main tables:

#### Core Tables

- `collections` - Hadith collection metadata
- `books` - Books within collections
- `chapters` - Chapters within books
- `hadiths` - Individual hadith records with Arabic and English text
- `categories` - Thematic categories
- `tags` - Topic tags

#### User Tables

- `profiles` - User profile information
- `saved_hadiths` - User's bookmarked hadiths
- `user_notes` - Personal notes on hadiths
- `user_stats` - Reading statistics and XP
- `user_achievements` - Unlocked achievements
- `user_activity_log` - Activity tracking for streaks

#### Learning Tables

- `learning_paths` - Structured curricula
- `lessons` - Individual lessons
- `user_lesson_progress` - User progress tracking

#### Premium Tables

- `subscriptions` - Stripe subscription records
- `promo_codes` - Referral and campaign codes
- `redemptions` - Code usage tracking

#### Mobile-Specific Tables

- `hadith_folders` - User-created folders
- `folder_collaborators` - Sharing and permissions
- `folder_comments` - Comments on saved hadiths

### Running Migrations

```bash
# All migrations are in /supabase/migrations/
# Run them in order through Supabase SQL Editor or CLI
```

---

## 🤖 AI Assistant

The AI assistant uses **Groq's Llama 3.3 70B** model with streaming support via the Vercel AI SDK.

### Web Implementation

```typescript
// app/api/chat/route.ts
import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages,
    system: 'You are an Islamic scholar assistant...'
  })
  
  return result.toDataStreamResponse()
}
```

### Mobile Implementation

```typescript
// authentichadithapp/lib/api/groq.ts
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  })
  
  const data = await response.json()
  return data.response
}
```

---

## 💎 Premium Features

### Subscription Tiers (Web)

| Tier | Price | Features |
|------|-------|----------|
| **Bronze** | $2.99/mo | Remove ads, Save unlimited hadiths, Basic stats |
| **Silver** | $4.99/mo | All Bronze + Learning paths, Advanced search, XP boost 1.5x |
| **Gold** | $8.99/mo | All Silver + AI assistant, Priority support, XP boost 2x |

### Promo Codes (Mobile)

- **Referral codes** - 7-day premium per use
- **Campaign codes** - Custom duration
- **QR code generation** - Easy sharing

---

## 📊 Analytics & Gamification

### XP System

Users earn XP for various activities:

- Read hadith: 5 XP
- Save hadith: 10 XP
- Write note: 15 XP
- Share hadith: 10 XP
- Complete story: 50 XP
- Complete quiz: 30 XP

### Achievements

Unlocked based on user stats (e.g., read 100 hadiths, maintain 7-day streak)

### Leaderboard

Weekly and all-time XP rankings

---

## 🔍 Search Features

### TruthSerum v2 (Mobile)

Smart search with synonym expansion across 35 topics:

- Faith, Prayer, Fasting, Charity, Pilgrimage
- Knowledge, Parents, Neighbors, Food, Cleanliness
- And 25 more categories...

### Advanced Filters

- Collection filtering
- Grade filtering (Sahih, Hasan, Daif)
- Book and chapter navigation
- Category and tag search

---

## 📱 Offline Support (Mobile)

### SQLite Caching

- Automatic caching of viewed hadiths
- Folder and saved hadith persistence
- Sync manager for online/offline transitions

### Implementation

```typescript
// lib/offline/sqlite-db.ts
- cacheHadith(hadith)
- getCachedHadith(id)
- cacheFolder(folder)
- syncWhenOnline()
```

---

## 🌐 Deployment

### Web Application (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Automatic Deployments** - Configure GitHub integration for automatic deployments on push.

### Mobile Application (Expo EAS)

```bash
# Login to Expo
npx eas login

# Configure build
npx eas build:configure

# Build
npx eas build --platform all

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

---

## 🧪 Testing

### Web Application

```bash
# Run ESLint
pnpm lint

# Type checking
pnpm type-check
```

### Mobile Application

```bash
# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 📝 Key Implementation Notes

### Hadith Data Seeding

The application can seed hadith data from a CDN (fawazahmed0/hadith-api):

```typescript
// Visit /api/seed?collection=sahih-bukhari
// Automatically fetches English and Arabic editions
// Processes books, chapters, and hadiths
// Handles grade distribution and metadata
```

### Authentication Flow

1. Supabase Auth for both web and mobile
2. Secure token storage (cookies on web, SecureStore on mobile)
3. Protected routes and API endpoints
4. Guest mode support on mobile

### Real-time Features

- Supabase Realtime for live updates
- Optimistic UI updates with TanStack Query
- Automatic cache invalidation

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- **Hadith Data** - [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api)
- **UI Components** - [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com)
- **AI Provider** - [Groq](https://groq.com)
- **Icons** - [Lucide](https://lucide.dev), [Expo Vector Icons](https://icons.expo.fyi)

---

## 📧 Support

For questions or support:

- **GitHub Issues** - [Open an issue](https://github.com/rsemeah/AuthenticHadithApp/issues)
- **Email** - support@authentichadith.app
- **Discord** - Join our community

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Advanced hadith commentary system
- [ ] Audio recitations (Arabic + English)
- [ ] Social features (follow users, share collections)
- [ ] Multi-language support (French, Urdu, Indonesian)
- [ ] Custom themes and fonts
- [ ] Improved offline support
- [ ] Progressive Web App (PWA) for web
- [ ] Desktop applications (Electron)

---

**Built with ❤️ by the Authentic Hadith team**

---

*Last updated: February 2026*
