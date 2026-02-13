#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <USER_UUID>"
  exit 1
fi
USER_ID=$1
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SERVICE_ROLE_KEY:-}" ]; then
  echo "Set SUPABASE_URL and SERVICE_ROLE_KEY environment variables before running this script."
  exit 1
fi
node scripts/test-delete-flow.js "$SUPABASE_URL" "$SERVICE_ROLE_KEY" "$USER_ID"
