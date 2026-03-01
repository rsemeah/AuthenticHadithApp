#!/usr/bin/env bash
set -euo pipefail
MIG_DIR="external/v0-authentic-hadith/supabase/migrations"
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL not set. Aborting."
  exit 1
fi
if [ ! -d "$MIG_DIR" ]; then
  echo "Migrations dir $MIG_DIR not found"
  exit 1
fi
shopt -s nullglob
files=("$MIG_DIR"/*.sql)
if [ ${#files[@]} -eq 0 ]; then
  echo "No .sql files found in $MIG_DIR"
  exit 0
fi
for f in "${files[@]}"; do
  echo "Applying $f"
  psql "$SUPABASE_DB_URL" -f "$f"
done

echo "Migrations applied."
