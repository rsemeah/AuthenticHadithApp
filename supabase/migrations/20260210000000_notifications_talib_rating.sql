-- Migration: Notifications Engine (QBos-adapted) + Talib Rating System
-- 10 new tables, badge definitions, tier progression, notification templates
-- ============================================================

-- ============================================================
-- 1. PUSH TOKENS — Expo push tokens per device
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tokens" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 2. NOTIFICATION TEMPLATES — Mustache-style {{variable}} templates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_template text NOT NULL,
  body_template text NOT NULL,
  channel text NOT NULL DEFAULT 'push' CHECK (channel IN ('push', 'email', 'both')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are public read" ON public.notification_templates
  FOR SELECT USING (true);

-- ============================================================
-- 3. NOTIFICATION QUEUE — Priority-based with retry logic
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_slug text REFERENCES public.notification_templates(slug),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  channel text NOT NULL DEFAULT 'push' CHECK (channel IN ('push', 'email', 'both')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  scheduled_for timestamptz DEFAULT now(),
  sent_at timestamptz,
  retry_count int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 3,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.notification_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_queue_pending ON public.notification_queue (status, priority, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_queue_user ON public.notification_queue (user_id, created_at DESC);

-- ============================================================
-- 4. NOTIFICATION LOGS — Delivery tracking & analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.notification_queue(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_slug text,
  channel text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked')),
  provider_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own logs" ON public.notification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_logs_user ON public.notification_logs (user_id, created_at DESC);

-- ============================================================
-- 5. NOTIFICATION PREFERENCES — Per-type toggles + quiet hours
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_hadith boolean DEFAULT true,
  daily_hadith_time time DEFAULT '06:00',
  learning_reminders boolean DEFAULT true,
  streak_alerts boolean DEFAULT true,
  social_notifications boolean DEFAULT true,
  email_reminders boolean DEFAULT true,
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '06:00',
  timezone text DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 6. USER STREAKS — Daily activity tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_active_date date,
  streak_started_at date,
  total_active_days int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own streaks" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 7. USER XP — Experience points & Talib Rating tier
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp int NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'talib' CHECK (tier IN (
    'talib', 'mutaallim', 'murid', 'hafidh', 'muhaddith', 'alim', 'scholar'
  )),
  lessons_completed int NOT NULL DEFAULT 0,
  quizzes_taken int NOT NULL DEFAULT 0,
  quizzes_perfect int NOT NULL DEFAULT 0,
  hadith_shared int NOT NULL DEFAULT 0,
  referrals_completed int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own xp" ON public.user_xp
  FOR ALL USING (auth.uid() = user_id);
-- Allow public read for leaderboard
CREATE POLICY "Public read for leaderboard" ON public.user_xp
  FOR SELECT USING (true);

-- ============================================================
-- 8. USER BADGES — Earned achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_slug text NOT NULL,
  badge_name text NOT NULL,
  badge_description text,
  badge_icon text,
  xp_awarded int NOT NULL DEFAULT 0,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_slug)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own badges" ON public.user_badges
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read badges" ON public.user_badges
  FOR SELECT USING (true);

-- ============================================================
-- 9. QUIZ QUESTIONS — Auto-generated + optional curated
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  hadith_id uuid REFERENCES public.hadith(id) ON DELETE CASCADE,
  question_type text NOT NULL CHECK (question_type IN (
    'collection', 'narrator', 'grading', 'completion', 'book'
  )),
  question_text text NOT NULL,
  correct_answer text NOT NULL,
  wrong_answers text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN (
    'beginner', 'intermediate', 'advanced', 'scholar'
  )),
  is_curated boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz questions public read" ON public.quiz_questions
  FOR SELECT USING (true);

CREATE INDEX idx_quiz_lesson ON public.quiz_questions (lesson_id);
CREATE INDEX idx_quiz_hadith ON public.quiz_questions (hadith_id);

-- ============================================================
-- 10. QUIZ ATTEMPTS — Per-user quiz results
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score int NOT NULL,
  total_questions int NOT NULL,
  is_perfect boolean NOT NULL DEFAULT false,
  xp_earned int NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]',
  completed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own attempts" ON public.quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_attempts_user ON public.quiz_attempts (user_id, lesson_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Award XP and recalculate tier
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_amount int,
  p_action text DEFAULT 'other'
) RETURNS jsonb AS $$
DECLARE
  v_new_total int;
  v_new_tier text;
  v_old_tier text;
  v_tier_changed boolean := false;
BEGIN
  -- Upsert user_xp row
  INSERT INTO public.user_xp (user_id, total_xp)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_xp.total_xp + p_amount,
    lessons_completed = CASE WHEN p_action = 'lesson_complete' THEN user_xp.lessons_completed + 1 ELSE user_xp.lessons_completed END,
    quizzes_taken = CASE WHEN p_action = 'quiz_complete' THEN user_xp.quizzes_taken + 1 ELSE user_xp.quizzes_taken END,
    quizzes_perfect = CASE WHEN p_action = 'quiz_perfect' THEN user_xp.quizzes_perfect + 1 ELSE user_xp.quizzes_perfect END,
    hadith_shared = CASE WHEN p_action = 'share' THEN user_xp.hadith_shared + 1 ELSE user_xp.hadith_shared END,
    referrals_completed = CASE WHEN p_action = 'referral' THEN user_xp.referrals_completed + 1 ELSE user_xp.referrals_completed END,
    updated_at = now()
  RETURNING total_xp, tier INTO v_new_total, v_old_tier;

  -- Calculate new tier based on XP thresholds
  v_new_tier := CASE
    WHEN v_new_total >= 15000 THEN 'scholar'
    WHEN v_new_total >= 7000 THEN 'alim'
    WHEN v_new_total >= 3500 THEN 'muhaddith'
    WHEN v_new_total >= 1500 THEN 'hafidh'
    WHEN v_new_total >= 500 THEN 'murid'
    WHEN v_new_total >= 100 THEN 'mutaallim'
    ELSE 'talib'
  END;

  -- Update tier if changed
  IF v_new_tier != v_old_tier THEN
    UPDATE public.user_xp SET tier = v_new_tier WHERE user_id = p_user_id;
    v_tier_changed := true;
  END IF;

  RETURN jsonb_build_object(
    'total_xp', v_new_total,
    'xp_added', p_amount,
    'tier', v_new_tier,
    'tier_changed', v_tier_changed,
    'previous_tier', v_old_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record streak activity for today
CREATE OR REPLACE FUNCTION public.record_daily_activity(
  p_user_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_streak record;
  v_new_streak int;
  v_milestone boolean := false;
BEGIN
  -- Get or create streak record
  INSERT INTO public.user_streaks (user_id, current_streak, last_active_date, streak_started_at, total_active_days)
  VALUES (p_user_id, 1, v_today, v_today, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE
      WHEN user_streaks.last_active_date = v_today THEN user_streaks.current_streak  -- Already counted today
      WHEN user_streaks.last_active_date = v_today - 1 THEN user_streaks.current_streak + 1  -- Consecutive
      ELSE 1  -- Streak broken, restart
    END,
    longest_streak = GREATEST(
      user_streaks.longest_streak,
      CASE
        WHEN user_streaks.last_active_date = v_today THEN user_streaks.current_streak
        WHEN user_streaks.last_active_date = v_today - 1 THEN user_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_active_date = v_today,
    streak_started_at = CASE
      WHEN user_streaks.last_active_date = v_today THEN user_streaks.streak_started_at
      WHEN user_streaks.last_active_date = v_today - 1 THEN user_streaks.streak_started_at
      ELSE v_today
    END,
    total_active_days = CASE
      WHEN user_streaks.last_active_date = v_today THEN user_streaks.total_active_days
      ELSE user_streaks.total_active_days + 1
    END,
    updated_at = now()
  RETURNING * INTO v_streak;

  -- Check for milestone streaks (7, 30, 100)
  v_new_streak := v_streak.current_streak;
  v_milestone := v_new_streak IN (7, 30, 100, 365);

  -- Award streak XP (only if not already counted today)
  IF v_streak.last_active_date = v_today THEN
    PERFORM public.award_xp(p_user_id, 5, 'streak');
  END IF;

  RETURN jsonb_build_object(
    'current_streak', v_streak.current_streak,
    'longest_streak', v_streak.longest_streak,
    'total_active_days', v_streak.total_active_days,
    'milestone', v_milestone,
    'milestone_days', v_new_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED: Notification Templates
-- ============================================================
INSERT INTO public.notification_templates (slug, title_template, body_template, channel, priority, category) VALUES
  ('daily_hadith', 'Your Daily Hadith', '{{hadith_preview}} — {{collection}}', 'push', 'normal', 'daily'),
  ('streak_milestone', 'MashaAllah! {{streak_days}}-Day Streak!', 'You''ve been consistent for {{streak_days}} days. The Prophet ﷺ said: "The most beloved deeds to Allah are the most consistent, even if small."', 'push', 'high', 'achievement'),
  ('streak_at_risk', 'Don''t Lose Your {{streak_days}}-Day Streak!', 'Open the app today to keep your streak alive. Just one lesson or hadith search counts!', 'push', 'urgent', 'engagement'),
  ('badge_earned', 'Badge Earned: {{badge_name}}', '{{badge_description}} You earned +{{xp_amount}} XP!', 'push', 'high', 'achievement'),
  ('tier_up', 'New Rank: {{tier_name}}!', 'You''ve reached the rank of {{tier_name}} ({{tier_arabic}}). Keep learning, keep growing.', 'push', 'high', 'achievement'),
  ('lesson_complete', 'Lesson Complete!', 'You finished "{{lesson_title}}". +{{xp_amount}} XP earned. Ready for the quiz?', 'push', 'normal', 'progress'),
  ('quiz_perfect', 'Perfect Score!', 'You got 100%% on "{{lesson_title}}" quiz! +{{xp_amount}} XP bonus.', 'push', 'high', 'achievement'),
  ('path_complete', 'Path Complete: {{path_name}}!', 'You completed all lessons in {{path_name}}. +200 XP! You''re one step closer to Scholar of Hadith.', 'push', 'high', 'achievement'),
  ('referral_redeemed', 'Someone Used Your Code!', '{{redeemer_name}} just joined using your referral code. You earned +100 XP!', 'push', 'high', 'social'),
  ('inactive_reminder', 'Assalamu Alaikum {{name}}', 'It''s been a while since you explored authentic hadith. Your learning journey awaits.', 'both', 'normal', 'engagement'),
  ('weekly_digest', 'Your Weekly Hadith Digest', 'You studied {{lessons_count}} lessons this week and earned {{xp_earned}} XP. Keep going!', 'email', 'low', 'digest'),
  ('promo_expiring', 'Your Premium Expires Soon', 'Your premium access expires in {{days_left}} days. Renew to keep learning without limits.', 'both', 'high', 'account'),
  ('new_lesson', 'New Lesson Available', 'A new lesson "{{lesson_title}}" has been added to {{path_name}}.', 'push', 'normal', 'content')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: Badge Definitions (stored as reference, earned copies go to user_badges)
-- ============================================================
-- Badge slugs and their criteria are enforced in application code.
-- Reference table for display purposes:
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  slug text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  arabic_name text,
  criteria_type text NOT NULL,
  criteria_value int NOT NULL DEFAULT 1,
  xp_reward int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0
);

INSERT INTO public.badge_definitions (slug, name, description, icon, arabic_name, criteria_type, criteria_value, xp_reward, sort_order) VALUES
  ('first_step', 'First Step', 'Complete your first lesson', 'footsteps-outline', 'الخطوة الأولى', 'lessons_completed', 1, 10, 1),
  ('seeker_of_knowledge', 'Seeker of Knowledge', 'Complete 10 lessons', 'book-outline', 'طالب العلم', 'lessons_completed', 10, 50, 2),
  ('dedicated_learner', 'Dedicated Learner', 'Complete 25 lessons', 'school-outline', 'المتعلم المجتهد', 'lessons_completed', 25, 100, 3),
  ('century', 'Century', 'Complete 100 lessons... wait, we have 65. Complete them all!', 'trophy-outline', 'المئة', 'lessons_completed', 65, 500, 4),
  ('streak_7', 'Week of Devotion', 'Maintain a 7-day learning streak', 'flame-outline', 'أسبوع التفاني', 'streak_days', 7, 25, 5),
  ('streak_30', 'Month of Dedication', 'Maintain a 30-day learning streak', 'bonfire-outline', 'شهر الإخلاص', 'streak_days', 30, 100, 6),
  ('streak_100', 'Hundred Days of Light', 'Maintain a 100-day learning streak', 'sunny-outline', 'مائة يوم من النور', 'streak_days', 100, 500, 7),
  ('path_foundations', 'Foundation Builder', 'Complete Foundations of Faith', 'heart-outline', 'باني الأساس', 'path_complete', 1, 200, 8),
  ('path_daily', 'Daily Practitioner', 'Complete Daily Practice', 'sunny-outline', 'الممارس اليومي', 'path_complete', 2, 200, 9),
  ('path_character', 'Noble Character', 'Complete Character & Conduct', 'people-outline', 'صاحب الخلق', 'path_complete', 3, 200, 10),
  ('path_scholars', 'Hadith Connoisseur', 'Complete Scholars'' Deep Dive', 'school-outline', 'خبير الحديث', 'path_complete', 4, 200, 11),
  ('all_paths', 'Hadith Scholar', 'Complete all 4 learning paths', 'ribbon-outline', 'عالم الحديث', 'all_paths_complete', 4, 1000, 12),
  ('quiz_master', 'Quiz Master', 'Score 100% on 10 quizzes', 'checkmark-done-outline', 'سيد الاختبار', 'quizzes_perfect', 10, 100, 13),
  ('generous_soul', 'Generous Soul', 'Have 5 friends join via your referral', 'gift-outline', 'الكريم', 'referrals', 5, 200, 14),
  ('sharer_of_light', 'Sharer of Light', 'Share 50 hadith with others', 'share-outline', 'ناشر النور', 'hadith_shared', 50, 100, 15)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Update handle_new_user trigger to also create notification prefs, xp, streak
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create XP record
  INSERT INTO public.user_xp (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create streak record
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is updated
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
