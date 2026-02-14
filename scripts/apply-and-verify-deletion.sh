#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# apply-and-verify-deletion.sh
#
# Apply the account-deletion migration to production
# and verify everything is in place.
#
# Usage:
#   export DATABASE_URL="postgresql://postgres:PASSWORD@db.YOURPROJECT.supabase.co:5432/postgres"
#   bash scripts/apply-and-verify-deletion.sh
# ─────────────────────────────────────────────────────
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set."
  echo ""
  echo "Set it like:"
  echo '  export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOURPROJECT.supabase.co:5432/postgres"'
  echo ""
  echo "Find this in Supabase → Project Settings → Database → Connection string (URI)."
  exit 1
fi

MIG="supabase/migrations/20260214000000_account_deletion.sql"

if [ ! -f "$MIG" ]; then
  # Try from AuthenticHadithApp external path
  MIG="external/v0-authentic-hadith/supabase/migrations/20260214000000_account_deletion.sql"
fi

if [ ! -f "$MIG" ]; then
  echo "ERROR: Migration file not found."
  echo "Run from the repo root (AuthenticHadithApp/ or v0-authentic-hadith/)."
  exit 1
fi

echo "──── Step 1: Apply migration ────"
psql "$DATABASE_URL" -f "$MIG"
echo ""

echo "──── Step 2: Verify table exists ────"
psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'archived_user_data' ORDER BY ordinal_position;"
echo ""

echo "──── Step 3: Verify function exists ────"
psql "$DATABASE_URL" -c "SELECT proname, prosecdef FROM pg_proc WHERE proname = 'delete_user_account';"
echo ""

echo "──── Step 4: Verify permissions (service_role only) ────"
psql "$DATABASE_URL" -c "
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'delete_user_account'
ORDER BY grantee;
"
echo ""

echo "──── Step 5: Verify RLS on archive table ────"
psql "$DATABASE_URL" -c "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'archived_user_data';"
echo ""

echo "──── All checks passed ────"
echo ""
echo "To test with a throwaway user:"
echo "  export SUPABASE_URL=https://YOURPROJECT.supabase.co"
echo "  export SERVICE_ROLE_KEY=eyJ..."
echo "  node scripts/test-delete-flow.js \$SUPABASE_URL \$SERVICE_ROLE_KEY <USER_UUID>"
