# Authentic Hadith Mobile App

A React Native mobile application for accessing 36,246 authentic Islamic hadiths.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

## 📱 Features

- **36,246 Authentic Hadiths** from 8 major collections
- **Smart Search** with TruthSerum v2 synonym expansion (35 topics)
- **Learning Paths** with structured curriculum
- **Premium Features** with subscription support
- **Offline Mode** with SQLite caching
- **QR Referral Codes** for sharing
- **Guest Mode** for browsing without account
- **Arabic RTL Support** with proper text display

## 🛠 Tech Stack

- **React Native** 0.81.5
- **Expo SDK** 54
- **TypeScript** (strict mode)
- **Expo Router** 6 (file-based routing)
- **Supabase** 2.39.7 (backend + auth)
- **TanStack Query** 5.17 (state management)
- **Expo SecureStore** (secure token storage)
- **SQLite** (offline caching)
- **React Native QR Code SVG** (referral codes)

## 📂 Project Structure

```
authentichadithapp/
├── app/                      # 14 screens (Expo Router)
│   ├── _layout.tsx          # Root layout with providers
│   ├── +not-found.tsx       # 404 handler
│   ├── (tabs)/              # Tab navigation (6 tabs)
│   ├── auth/                # Login, signup, forgot password
│   ├── hadith/              # Hadith detail screen
│   ├── collection/          # Collection hadiths list
│   ├── learn/               # Learning paths & lessons
│   └── redeem/              # Promo code redemption
│
├── components/
│   ├── hadith/              # HadithCard, HadithList, GradeBadge
│   ├── ui/                  # Button, Card, Input, LoadingSpinner
│   ├── premium/             # PremiumGate
│   ├── share/               # ShareSheet
│   └── common/              # ErrorBoundary
│
├── lib/
│   ├── supabase/            # Supabase client with SecureStore
│   ├── auth/                # AuthProvider
│   ├── search/              # TruthSerum v2 topic synonyms
│   ├── offline/             # SQLite + sync manager
│   ├── styles/              # Design tokens (colors, spacing)
│   └── premium/             # Subscription checks
│
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript definitions
└── supabase/migrations/     # Database migrations
```

## 🎨 Design System

### Colors
- **Emerald Green**: Primary brand color (#1b5e43)
- **Gold**: Accent color (#c5a059)
- **Marble Base**: Background (#f8f6f2)

### Typography
- Font sizes: 10-28px
- Arabic RTL support
- System fonts

## 🔐 Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_APP_ENV=development
```

## 📊 Database

### Existing Tables (from web app)
- `hadiths` - All hadith content
- `collections` - Hadith collections
- `profiles` - User profiles
- `subscriptions` - Premium subscriptions
- `saved_hadiths` - Bookmarked hadiths

### New Tables (mobile-specific)
- `promo_codes` - Referral and campaign codes
- `redemptions` - Code redemption tracking
- `learning_paths` - Structured learning paths
- `lessons` - Individual lessons
- `path_lessons` - Path-lesson relationships
- `lesson_hadith` - Lesson-hadith relationships
- `user_lesson_progress` - User progress tracking

### Running Migrations

Execute SQL files in order:
1. `supabase/migrations/999-mobile-app-tables.sql`
2. `supabase/migrations/998-redeem-function.sql`
3. `supabase/migrations/997-seed-learning-paths.sql`

## 🧪 Testing

```bash
# TypeScript type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 📦 Building

```bash
# Development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview build (for TestFlight)
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

## 🚀 Deployment

### iOS (TestFlight)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android (Google Play)
```bash
eas build --platform android --profile production
eas submit --platform android
```

## 📝 Key Screens

1. **Home** - Random hadith of the moment
2. **Collections** - Browse 8 major collections
3. **Search** - Smart search with synonym expansion
4. **Learn** - Structured learning paths
5. **Assistant** - AI assistant (premium)
6. **Profile** - User account management

## 🔒 Authentication

- Email/password via Supabase Auth
- Guest mode for browsing
- Password reset flow
- Auto-profile creation
- SecureStore for token persistence

## 💎 Premium Features

- AI Assistant (TruthSerum v2)
- Unlimited learning paths
- Offline mode
- Ad-free experience
- Promo code redemption
- QR referral codes

## 📖 Learning Paths

4 difficulty levels:
- **Beginner**: Foundations of Faith (21 days)
- **Intermediate**: Daily Practice (30 days)
- **Advanced**: Character & Ethics (45 days, premium)
- **Scholar**: Deep Dive (60 days, premium)

## 🔍 Search (TruthSerum v2)

35-topic synonym engine including:
- Prayer, fasting, charity, washing
- Marriage, divorce, parents
- Patience, forgiveness, repentance
- Knowledge, faith, sincerity
- And 23 more topics

## 🌐 Shared Backend

This app shares the same Supabase project with the web app at [authentichadith.app](https://authentichadith.app).

## 📄 License

Copyright © 2026 Authentic Hadith App

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.
