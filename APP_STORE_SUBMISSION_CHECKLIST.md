# App Store Submission Checklist — Authentic Hadith

> Complete these steps **in order** before clicking Submit in App Store Connect.

---

## 1. Apply Deletion Migration to Production DB

**File:** `external/v0-authentic-hadith/supabase/migrations/20260214_archive_and_restrict_delete_user_account.sql`

### Steps (Supabase SQL Editor — recommended)

1. Open your Supabase project dashboard: <https://supabase.com/dashboard/project/nqklipakrfuwebkdnhwg>
2. Go to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Paste the entire contents of `20260214_archive_and_restrict_delete_user_account.sql`.
5. Click **Run** (or Cmd+Enter).
6. Verify success:
   ```sql
   -- Should return the function signature
   SELECT proname, proargtypes FROM pg_proc WHERE proname = 'delete_user_account';

   -- Should return the archive table
   SELECT * FROM information_schema.tables WHERE table_name = 'archived_user_data';
   ```
7. Test with a **throwaway test user** (not a real account):
   ```sql
   SELECT delete_user_account('TEST_USER_UUID_HERE');
   SELECT * FROM archived_user_data ORDER BY archived_at DESC LIMIT 1;
   ```

### Alternative: psql CLI
```bash
psql "$DATABASE_URL" -f supabase/migrations/20260214_archive_and_restrict_delete_user_account.sql
```

> **Warning:** Run during a low-traffic window. The migration is additive (creates table + function), so it should not cause downtime.

---

## 2. Set Environment Secrets for Server Deployment

### Vercel (web backend — v0-authentic-hadith)

In the Vercel dashboard for your project:

| Variable | Value | Notes |
|----------|-------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (your service role key) | Required for delete-account and webhooks |
| `REVENUECAT_WEBHOOK_SECRET` | Your RevenueCat webhook auth token | For webhook signature verification |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production Stripe key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |

After adding, trigger a **redeploy** from the Vercel dashboard (Deployments → latest → Redeploy).

### EAS Secrets (mobile app — AuthenticHadithApp)

```bash
# Set your production RevenueCat iOS key
eas secret:create --scope project --name REVENUECAT_IOS_KEY --value "appl_YOUR_PRODUCTION_KEY_HERE"

# (Optional) Android key for future Google Play submission
eas secret:create --scope project --name REVENUECAT_ANDROID_KEY --value "goog_YOUR_KEY_HERE"
```

Verify secrets are set:
```bash
eas secret:list
```

---

## 3. Configure In-App Purchases in App Store Connect

### Product IDs to Create

These must match **exactly** in App Store Connect, RevenueCat dashboard, and the source code:

| Product | App Store Connect Product ID | Price | Type |
|---------|------------------------------|-------|------|
| Monthly Premium | `ah_monthly_999` | $9.99/month | Auto-Renewable Subscription |
| Annual Premium | `ah_annual_4999` | $49.99/year | Auto-Renewable Subscription |
| Lifetime Access | `ah_lifetime_9999` | $99.99 | Non-Consumable |

### Steps in App Store Connect

1. Go to **My Apps** → **Authentic Hadith** → **Features** → **Subscriptions**
2. Create a **Subscription Group** named `Authentic Hadith Premium`
3. Add subscription products:
   - `ah_monthly_999`: $9.99, 1 month, 7-day free trial
   - `ah_annual_4999`: $49.99, 1 year
4. Go to **Features** → **In-App Purchases** for the one-time product:
   - `ah_lifetime_9999`: $99.99, Non-Consumable
5. Submit all products for review (they'll be reviewed alongside the app)

### RevenueCat Dashboard

1. Go to your RevenueCat project → **Products**
2. Ensure all three App Store product IDs are registered
3. Go to **Entitlements** → ensure `premium` entitlement exists and all three products grant it
4. Go to **Offerings** → configure a default offering with packages:
   - `$rc_monthly` → `ah_monthly_999`
   - `$rc_annual` → `ah_annual_4999`
   - `$rc_lifetime` → `ah_lifetime_9999`

---

## 4. EAS Build and Submit Commands

### Pre-flight Checks

```bash
cd authentichadithapp

# Verify EAS is logged in
eas whoami

# Verify secrets are set
eas secret:list

# Verify the app compiles
npx expo export --platform ios
```

### Build for iOS

```bash
# Production build (auto-increments version)
eas build --platform ios --profile production
```

This will:
- Use managed signing (EAS manages certificates and provisioning profiles)
- Read `REVENUECAT_IOS_KEY` from EAS secrets
- Inject it via `app.config.js` into `Constants.expoConfig.extra.revenueCatApiKeyIos`
- Produce an IPA ready for TestFlight / App Store

### Submit to TestFlight (after build completes)

```bash
# Submit the latest build
eas submit --platform ios --latest

# Or submit a specific build
eas submit --platform ios --id BUILD_ID_HERE
```

### Submit to App Store (after TestFlight QA passes)

The `eas submit` command above uploads to App Store Connect. From there:
1. Go to App Store Connect → TestFlight → wait for processing
2. Add internal/external testers
3. QA the build (see Section 5)
4. When ready: go to App Store Connect → App Store tab → select the build → Submit for Review

---

## 5. TestFlight End-to-End Testing Checklist

Test all of these on a real device via TestFlight:

- [ ] **App launches** without crashes
- [ ] **Sign up** with email/password works
- [ ] **Sign in** with existing account works
- [ ] **Google OAuth** sign-in works (if enabled)
- [ ] **Apple Sign In** works (if enabled)
- [ ] **Paywall screen** appears and shows correct pricing
- [ ] **Purchase monthly** subscription in sandbox
- [ ] **Purchase annual** subscription in sandbox
- [ ] **Purchase lifetime** in sandbox
- [ ] **Restore Purchases** button works
- [ ] **Premium features** unlock after purchase (AI assistant, advanced search, etc.)
- [ ] **Delete Account** flow:
  - Navigate to Settings → Delete Account
  - Type "DELETE" and confirm
  - Verify account is removed (can't sign in again)
  - Verify `archived_user_data` table has the snapshot (check Supabase)
- [ ] **Offline mode** works (cached hadiths load without network)
- [ ] **Dark mode** toggle works
- [ ] **Search** returns results
- [ ] **Saved hadiths** persist across sessions

---

## 6. App Store Reviewer Notes

Copy-paste this into the **Review Notes** field in App Store Connect:

```
DEMO ACCOUNT
Email: reviewer@authentichadith.app
Password: ReviewerTest2026!

(Create this account in your Supabase auth dashboard before submission.)

SUBSCRIPTION TESTING
The app uses RevenueCat for in-app purchases. All three subscription options
(Monthly $9.99, Annual $49.99, Lifetime $99.99) are configured and can be
tested in sandbox mode.

IN-APP ACCOUNT DELETION
Location: Settings tab → scroll to bottom → "Delete Account"
The user must type "DELETE" to confirm. This permanently archives and removes
all user data (profile, saved hadiths, subscriptions, learning progress) and
deletes the auth account. Archived data is retained for 30 days for compliance
before permanent removal.

PRIVACY
- Data collected: email, display name (optional), saved hadiths, learning progress
- Data shared: none (no third-party analytics or advertising SDKs)
- Data deletion: fully supported via in-app deletion (Settings → Delete Account)
- Third-party services: Supabase (database/auth), RevenueCat (subscriptions),
  Groq (AI explanations — no user data stored)

AI FEATURES
The AI Assistant tab uses Groq's API to provide hadith explanations and answers
to Islamic knowledge questions. No user queries are stored or used for training.
```

---

## 7. App Store Privacy Answers

When filling out the App Privacy section in App Store Connect:

| Question | Answer |
|----------|--------|
| Do you collect data? | Yes |
| Contact Info (email) | Collected, linked to identity, for app functionality |
| User Content (saved hadiths, notes) | Collected, linked to identity, for app functionality |
| Usage Data (learning progress) | Collected, linked to identity, for app functionality |
| Identifiers (user ID) | Collected, linked to identity, for app functionality |
| Do you use data for tracking? | No |
| Do you share data with third parties? | No |

---

## 8. Key Rotation Checklist

If any of these keys were exposed in git history, logs, or shared channels — rotate them:

| Key | Where to Rotate | Where to Update |
|-----|-----------------|-----------------|
| Supabase service role key | Supabase Dashboard → Settings → API → Regenerate | Vercel env vars, GitHub secrets |
| Groq API key | Groq Console → API Keys → Regenerate | Vercel env vars |
| Stripe secret key | Stripe Dashboard → Developers → API Keys → Roll | Vercel env vars |
| Stripe webhook secret | Stripe Dashboard → Developers → Webhooks → Signing secret | Vercel env vars |
| RevenueCat API keys | RevenueCat Dashboard → Project → API Keys | EAS secrets |
| Supabase anon key | Generally safe (public, RLS-enforced) | No rotation needed unless compromised with service role |

### Steps
1. Generate new key in the provider's dashboard
2. Update in Vercel / EAS secrets
3. Redeploy
4. Verify the old key no longer works
5. Delete the old key from the provider

---

## Summary: Launch Sequence

1. ✅ Code fixes pushed (delete-account, RevenueCat config, product IDs)
2. ⬜ Apply SQL migration to production Supabase
3. ⬜ Set SUPABASE_SERVICE_ROLE_KEY in Vercel → Redeploy
4. ⬜ Set REVENUECAT_IOS_KEY in EAS secrets
5. ⬜ Create IAP products in App Store Connect (matching IDs above)
6. ⬜ Configure products in RevenueCat dashboard
7. ⬜ Create reviewer demo account in Supabase auth
8. ⬜ Run `eas build --platform ios --profile production`
9. ⬜ Run `eas submit --platform ios --latest`
10. ⬜ QA on TestFlight (use checklist above)
11. ⬜ Fill App Store metadata (screenshots, privacy, reviewer notes)
12. ⬜ Rotate any compromised keys
13. ⬜ Submit for Review
