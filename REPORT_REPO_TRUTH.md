# Repo Truth Report — AuthenticHadithApp

**Generated:** 2026-02-07
**Repo:** `rsemeah/AuthenticHadithApp`
**Branch:** `claude/authentic-hadith-app-bvrxX`
**Latest commit:** `b64673d` fix: align code with actual Supabase hadith table schema

---

## Section A: Verified

### Repo identity
- **Single repo:** `/home/user/AuthenticHadithApp` — no sibling repos detected.
- **Remote:** `origin` -> `github.com/rsemeah/AuthenticHadithApp` (via local git proxy)
- **Framework:** Expo SDK 54 + Expo Router 6 (native React Native, NOT a WebView wrapper)
- **Language:** TypeScript

### Package.json scripts (verified present)
| Script | Command | Works? |
|--------|---------|--------|
| `start` | `expo start` | Requires `.env.local` + Supabase credentials |
| `web` | `expo start --web` | Web export verified (1.8 MB bundle, no errors) |
| `android` | `expo start --android` | Requires device/emulator |
| `ios` | `expo start --ios` | Requires macOS |

### Dependencies (verified installed)
- `expo@~54.0.33`, `react-native@0.81.5`, `react@19.1.0`
- `expo-router@~6.0.23` (file-based routing)
- `@supabase/supabase-js@^2.95.2` (database client)
- `@expo/vector-icons` (Ionicons for tab bar)
- `react-native-web@^0.21.0`, `react-dom@19.1.0` (web support)

### Supabase database (verified live)
- **Project ID:** `lwklogxdpjnvfxrlcnca`
- **Table:** `hadith` — **36,246 rows** (verified via `content-range: 0-0/36246`)
- **Key columns (verified):** `id` (UUID), `collection_name`, `book`, `chapter`, `arabic_text`, `english_text`, `grading`, `reference`, `narrator`, `hadith_number`, `tsv` (full-text search vector)
- **Collections found:** Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami\` at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Malik, Legacy Hadith

### Routing / screens (verified in code)
| Route | File | Wired to data? | Status |
|-------|------|-----------------|--------|
| Home tab (`/`) | `app/(tabs)/index.tsx` | Yes — fetches random hadith | Working |
| Collections tab | `app/(tabs)/collections.tsx` | Yes — groups by `collection_name` | Working |
| Search tab | `app/(tabs)/search.tsx` | Yes — `ilike` search on `english_text`/`arabic_text` | Working |
| Assistant tab | `app/(tabs)/assistant.tsx` | Yes — retrieval-first chat (TruthSerum) | Working |
| Profile tab | `app/(tabs)/profile.tsx` | Static — guest mode, app info | Working (no auth) |
| Hadith detail | `app/hadith/[id].tsx` | Yes — fetches by UUID | Working |

### Shared components (verified)
- `components/HadithCard.tsx` — displays Arabic (RTL), English, narrator, grade badge, reference
- `lib/supabase.ts` — Supabase client with AsyncStorage
- `lib/colors.ts` — theme constants (green/gold Islamic palette)
- `lib/queries.ts` — `HADITH_COLUMNS` select string

### Build verification
- `npx expo export --platform web` — **passes** (bundle: 1.8 MB, no errors)
- No test suite configured (no `jest`, `vitest`, or test scripts in `package.json`)
- No linter configured (no `.eslintrc`, no lint script)

### Environment files
- `.env.example` — template with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `.env.local` — present locally with real credentials (gitignored)
- `.gitignore` — correctly ignores `.env*.local`, `node_modules/`, `dist/`, etc.

---

## Section B: Missing

| Item | Status | Notes |
|------|--------|-------|
| Test suite | Not configured | No jest/vitest, no test scripts |
| Linter/formatter | Not configured | No eslint, prettier |
| EAS Build config | Not present | No `eas.json`, no EAS project |
| Auth / user accounts | Not implemented | v1 is guest-only (by design) |
| Push notifications | Not implemented | Future feature |
| Offline / caching | Not implemented | All queries hit Supabase live |
| Full-text search (tsv) | Not used yet | Code uses `ilike`; `tsv` column exists in DB |
| CI/CD pipeline | Not configured | No GitHub Actions |
| App icons / splash | Default Expo icons | Placeholder assets |

---

## Section C: Next Actions

1. **Run on device:** `npx expo start` then scan QR with Expo Go
2. **Add EAS config:** `npx eas init` + `npx eas build --profile development --platform android`
3. **Switch search to full-text:** Use Supabase `textSearch('tsv', query)` instead of `ilike`
4. **Add tests:** Install jest + `@testing-library/react-native`, add test script
5. **Custom app icons:** Replace `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`
6. **Performance:** Collections screen fetches all 36K rows to count client-side — add a Supabase RPC function for server-side grouping
