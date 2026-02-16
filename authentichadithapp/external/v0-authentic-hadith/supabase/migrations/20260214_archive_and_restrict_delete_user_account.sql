-- Archive-first account deletion and restrict execution to service_role
-- Safe to run on databases that may/may not have every table referenced.
-- Review the `tables_to_snapshot` list and adjust to your schema before applying.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS archived_user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now(),
  data jsonb NOT NULL
);

-- Function: snapshot user-scoped tables into archived_user_data, then delete live rows.
-- SECURITY DEFINER so it must be owned by a service-role user when installed,
-- and we will revoke public execute and grant only to the service role.
CREATE OR REPLACE FUNCTION delete_user_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tables_to_snapshot text[] := ARRAY[
    -- Add your user-scoped table names here (adjust as needed)
    'hadith',
    'my_hadith',
    'bookmarks',
    'notes',
    'subscriptions',
    'purchases'
  ];
  t text;
  snap jsonb;
  q text;
BEGIN
  snap := '{}'::jsonb;

  FOREACH t IN ARRAY tables_to_snapshot
  LOOP
    -- only act if table exists
    IF to_regclass(t) IS NOT NULL THEN
      q := format('SELECT coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM %I t WHERE (t.user_id = $1) OR (t.user_uuid = $1)', t);
      EXECUTE q USING p_user_id INTO STRICT snap;
      -- attach per-table snapshot into combined json
      IF snap IS NULL THEN
        snap := jsonb_build_object(t, '[]'::jsonb);
      ELSE
        snap := jsonb_build_object(t, snap);
      END IF;

      -- delete rows (use safe dynamic SQL)
      q := format('DELETE FROM %I WHERE (user_id = %L) OR (user_uuid = %L)', t, p_user_id::text, p_user_id::text);
      EXECUTE q;
    END IF;
  END LOOP;

  -- Snapshot auth.user row when possible
  IF to_regclass('auth.users') IS NOT NULL THEN
    PERFORM 1; -- placeholder to ensure auth schema exists
    BEGIN
      SELECT row_to_json(u.*)::jsonb
      INTO STRICT snap
      FROM auth.users u
      WHERE u.id = p_user_id;
      -- wrap user snapshot under key "auth.users"
      IF snap IS NOT NULL THEN
        snap := jsonb_build_object('auth.users', snap) || snap;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- ignore if auth.users not accessible
      NULL;
    END;
  END IF;

  -- Insert combined snapshot (if any)
  INSERT INTO archived_user_data (user_id, data)
  VALUES (p_user_id, coalesce(snap, '{}'::jsonb));

  -- Mark auth user as deleted (if auth.users exists and has a deleted_at-like field)
  IF to_regclass('auth.users') IS NOT NULL THEN
    BEGIN
      -- try to set metadata or a deleted flag if possible; tolerate failure
      EXECUTE format('UPDATE auth.users SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, ''{}''::jsonb), ''{deleted_at}'', to_jsonb(now()::text)) WHERE id = %L', p_user_id::text);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;

-- Harden permissions: revoke public and allow only the service role
REVOKE EXECUTE ON FUNCTION delete_user_account(uuid) FROM PUBLIC;
-- Replace 'service_role' with the actual role name used by Supabase (the role name typically is 'service_role')
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO service_role;
