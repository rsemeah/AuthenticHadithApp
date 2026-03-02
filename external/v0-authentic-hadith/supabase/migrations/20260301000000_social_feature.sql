-- ============================================================
-- Migration: Social Feature
-- Date: 2026-03-01
-- Description: Adds community social layer — follow graph,
--   hadith posts with visibility tiers, and a report-based
--   auto-flagging safety engine.
-- ============================================================

BEGIN;

-- ─── 0. Allow authenticated users to view all profiles ────────────────────────
-- The default policy only lets users see their own profile.
-- Social features (feed author cards, Discover People) need read access for all.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND schemaname = 'public'
      AND policyname = 'Authenticated users can view all profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view all profiles"
      ON profiles FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;


-- ─── 1. user_follows ──────────────────────────────────────────────────────────
-- Directional follow graph: follower_id follows following_id.

CREATE TABLE IF NOT EXISTS user_follows (
  follower_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT uf_no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_uf_follower  ON user_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_uf_following ON user_follows (following_id);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated may read the follow graph (needed for feed + profile counts).
CREATE POLICY "Follows are public to authenticated users"
  ON user_follows FOR SELECT TO authenticated USING (true);

-- Users control only their own outgoing follow edges.
CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE USING (auth.uid() = follower_id);


-- ─── 2. hadith_posts ──────────────────────────────────────────────────────────
-- A user's reflection anchored to a hadith reference.

CREATE TABLE IF NOT EXISTS hadith_posts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Loose hadith reference (user-supplied; validated client-side)
  collection    text,
  hadith_number text,
  -- Optional tight FK when hadith_id is resolvable in our DB
  hadith_id     uuid        REFERENCES hadiths(id) ON DELETE SET NULL,

  reflection    text        NOT NULL
                            CHECK (char_length(trim(reflection)) BETWEEN 10 AND 1000),

  visibility    text        NOT NULL DEFAULT 'public'
                            CHECK (visibility IN ('public', 'followers', 'private')),

  -- Moderation status, managed by trigger + admins
  status        text        NOT NULL DEFAULT 'published'
                            CHECK (status IN ('published', 'flagged', 'removed')),

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Covering index for the feed query (most common read path)
CREATE INDEX IF NOT EXISTS idx_hp_feed
  ON hadith_posts (status, created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_hp_author
  ON hadith_posts (author_id);

ALTER TABLE hadith_posts ENABLE ROW LEVEL SECURITY;

-- One unified SELECT policy:
--   • Author always sees their own posts (all statuses except 'removed')
--   • Others see published posts according to visibility:
--       public    → everyone
--       followers → only the author's followers
CREATE POLICY "Select posts by visibility"
  ON hadith_posts FOR SELECT
  USING (
    status <> 'removed'
    AND (
      auth.uid() = author_id
      OR (
        status = 'published'
        AND (
          visibility = 'public'
          OR (
            visibility = 'followers'
            AND EXISTS (
              SELECT 1 FROM user_follows
              WHERE follower_id  = auth.uid()
                AND following_id = author_id
            )
          )
        )
      )
    )
  );

CREATE POLICY "Users create own posts"
  ON hadith_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors update own posts"
  ON hadith_posts FOR UPDATE
  USING  (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors delete own posts"
  ON hadith_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Keep updated_at fresh on any UPDATE
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_hp_updated_at ON hadith_posts;
CREATE TRIGGER tg_hp_updated_at
  BEFORE UPDATE ON hadith_posts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 3. post_reports ──────────────────────────────────────────────────────────
-- Users submit reports against posts they find problematic.
-- Accumulating ≥5 distinct reports automatically flags the post.

CREATE TABLE IF NOT EXISTS post_reports (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid        NOT NULL REFERENCES hadith_posts(id) ON DELETE CASCADE,
  reporter_id uuid        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  reason      text        NOT NULL
                          CHECK (reason IN (
                            'inappropriate', 'misinformation',
                            'offensive', 'spam', 'other'
                          )),
  details     text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- One report per user per post
  UNIQUE (post_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_pr_post ON post_reports (post_id);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can submit reports"
  ON post_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Reporters can see their own submissions (audit trail)
CREATE POLICY "Users can view their own reports"
  ON post_reports FOR SELECT USING (auth.uid() = reporter_id);


-- ─── 4. Auto-flag trigger ─────────────────────────────────────────────────────
-- When a post accumulates 5 distinct reports it is set to 'flagged'.
-- Flagged posts vanish from all feeds and are queued for admin review.
-- The threshold can be tuned in the function body without a schema change.

CREATE OR REPLACE FUNCTION fn_auto_flag_post()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_report_count integer;
  v_threshold    constant integer := 5;
BEGIN
  SELECT COUNT(*) INTO v_report_count
  FROM post_reports
  WHERE post_id = NEW.post_id;

  IF v_report_count >= v_threshold THEN
    UPDATE hadith_posts
    SET    status = 'flagged'
    WHERE  id     = NEW.post_id
      AND  status = 'published';   -- never un-'remove' a post
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_auto_flag_post ON post_reports;
CREATE TRIGGER tg_auto_flag_post
  AFTER INSERT ON post_reports
  FOR EACH ROW EXECUTE FUNCTION fn_auto_flag_post();


-- ─── 5. get_social_feed RPC ───────────────────────────────────────────────────
-- Returns a paginated, visibility-filtered feed for a given user.
-- SECURITY DEFINER so we can join across tables without RLS interference;
-- visibility rules are re-implemented manually in the WHERE clause.

CREATE OR REPLACE FUNCTION get_social_feed(
  p_user_id uuid,
  p_limit   integer DEFAULT 20,
  p_offset  integer DEFAULT 0
)
RETURNS TABLE (
  post_id       uuid,
  author_id     uuid,
  author_name   text,
  author_avatar text,
  collection    text,
  hadith_number text,
  hadith_id     uuid,
  reflection    text,
  visibility    text,
  created_at    timestamptz
)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT
    hp.id            AS post_id,
    hp.author_id,
    pr.name          AS author_name,
    pr.avatar_url    AS author_avatar,
    hp.collection,
    hp.hadith_number,
    hp.hadith_id,
    hp.reflection,
    hp.visibility,
    hp.created_at
  FROM hadith_posts hp
  JOIN profiles pr ON pr.user_id = hp.author_id
  WHERE
    hp.status = 'published'
    AND (
      -- Public posts from anyone
      hp.visibility = 'public'
      -- The requesting user's own posts (any visibility)
      OR hp.author_id = p_user_id
      -- Followers-only posts from people p_user_id follows
      OR (
        hp.visibility = 'followers'
        AND EXISTS (
          SELECT 1 FROM user_follows f
          WHERE f.follower_id  = p_user_id
            AND f.following_id = hp.author_id
        )
      )
    )
  ORDER BY hp.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;


-- ─── 6. get_user_social_counts RPC ───────────────────────────────────────────
-- Fetches follower / following / post counts for a user profile card.

CREATE OR REPLACE FUNCTION get_user_social_counts(p_user_id uuid)
RETURNS TABLE (
  followers_count bigint,
  following_count bigint,
  posts_count     bigint
)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT
    (SELECT COUNT(*) FROM user_follows WHERE following_id = p_user_id) AS followers_count,
    (SELECT COUNT(*) FROM user_follows WHERE follower_id  = p_user_id) AS following_count,
    (SELECT COUNT(*) FROM hadith_posts  WHERE author_id   = p_user_id
                                          AND status = 'published')    AS posts_count;
$$;

COMMIT;
