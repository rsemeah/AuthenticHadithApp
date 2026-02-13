# App Store Review Submission Packet

## App Review Notes

Authentic Hadith curates classical hadith collections from established scholarly sources
(Sahih al-Bukhari, Sahih Muslim, and six other canonical compilations). AI features
provide educational summaries only and do not issue religious rulings (fatwas).

### Test Account Credentials

- Email: `reviewer@authentichadith.app`
- Password: `ReviewTest2026!`

> Create this account in Supabase Auth before submission.

### How to Test Core Features (<60 seconds)

1. **Sign In** — use the test account above.
2. **Browse hadiths** — tap "Collections" → "Sahih al-Bukhari" → any chapter → any hadith.
3. **Save a hadith** — tap the bookmark icon on any hadith detail page.
4. **AI explanation** — tap "Explain" on a hadith (requires Premium tier for full response).
5. **Learning paths** — tap "Learn" → "Foundations of Hadith" → start a lesson.

### How to Test Account Deletion

1. Sign in with the test account.
2. Go to **Settings → Privacy & Security → Delete My Account**.
3. Type `DELETE` in the confirmation field.
4. Tap "Permanently Delete" — the account and all data are removed, and you are redirected to login.

### How to Test Subscriptions

1. Sign in with the test account.
2. Go to **Settings → Manage Subscription**.
3. Available plans are shown (requires sandbox tester Apple ID).
4. "Restore Purchases" button is available at the bottom of the subscription screen.

### How to Test Sign In with Apple

1. On the login screen, tap the "Apple" button.
2. Complete the Apple Sign In flow.
3. You are redirected to the app home screen.

---

## Payment Explanation

- **iOS**: Subscriptions use Apple In-App Purchase via RevenueCat. No external payment links
  are shown on iOS. Stripe is used only for the web version.
- **Plans**: Monthly Premium ($9.99/mo), Annual Premium ($49.99/yr), Lifetime ($99.99 one-time).
- **Free tier**: Full hadith browsing, bookmarking, and learning paths (first module of each path).
- **Premium tier**: AI explanations, advanced search, all learning path modules, unlimited saves.

---

## Data Deletion Explanation

Account deletion is available in-app at **Settings → Privacy & Security → Delete My Account**
(or on mobile: **Settings → Delete Account**).

When triggered:
1. All user data is archived to `archived_user_data` for brief integrity retention.
2. All user rows are deleted from 15+ tables (profiles, saved hadiths, learning progress, notes,
   streaks, AI queries, subscription metadata, etc.).
3. The auth user is deleted from Supabase Auth.
4. The user is signed out and cannot sign back in.

The server endpoint (`POST /api/delete-account`) requires an authenticated session. It uses a
service-role client to call a `SECURITY DEFINER` PostgreSQL function, then deletes the auth user.

---

## Content Methodology Statement

Authentic Hadith presents narrations from the following authenticated scholarly compilations:

- Sahih al-Bukhari
- Sahih Muslim
- Sunan Abu Dawud
- Jami' at-Tirmidhi
- Sunan an-Nasa'i
- Sunan Ibn Majah
- Muwatta Malik
- Musnad Ahmad

All narrations preserve their original source references and scholarly grading. AI-generated
explanations are clearly marked and separated from primary source text. The AI does not issue
fatwas, determine halal/haram status, or provide medical/legal advice.

---

## SDK List

| SDK | Purpose | Data Collected |
|-----|---------|----------------|
| Supabase JS | Auth + database | Email, user ID, usage data |
| Expo | App framework | Crash diagnostics (anonymous) |
| RevenueCat | In-app purchases | Purchase history, subscription status |
| Expo SecureStore | Token storage | Auth tokens (on-device only) |
| React Navigation | Navigation | None |

---

## Privacy Disclosures Summary

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|----------------|-------------------|
| Email Address | Yes | Yes | No |
| User ID | Yes | Yes | No |
| Purchase History | Yes | Yes | No |
| Usage Data | Yes | Yes | No |
| Diagnostics | Yes | No | No |

- No advertising identifiers collected.
- No data sold to third parties.
- Privacy policy: https://authentichadith.app/privacy

---

## Known Limitations

- Language selection is English-only in v1.0 (Arabic text is displayed alongside translations).
- Push notifications are not yet implemented (placeholder in settings).
- Offline mode is planned for v1.1.
