-- Migration: Auth profiles, learning paths, promo codes, and related tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- =============================================================
-- 1. USER PROFILES (extends auth.users)
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  premium_until timestamptz,
  last_seen_at timestamptz default now(),
  email_opt_in boolean default true,
  last_nudge_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- 2. LEARNING PATHS
-- =============================================================
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'scholar')),
  icon text default 'book-outline',
  lesson_count int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.learning_paths enable row level security;
create policy "learning_paths_public_read"
  on public.learning_paths for select using (true);

-- =============================================================
-- 3. LESSONS
-- =============================================================
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  teaching_text text,
  estimated_minutes int default 5,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;
create policy "lessons_public_read"
  on public.lessons for select using (true);

-- =============================================================
-- 4. PATH ↔ LESSON JOIN
-- =============================================================
create table if not exists public.path_lessons (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  sort_order int not null default 0,
  unique(path_id, lesson_id)
);

alter table public.path_lessons enable row level security;
create policy "path_lessons_public_read"
  on public.path_lessons for select using (true);

-- =============================================================
-- 5. LESSON ↔ HADITH JOIN
-- =============================================================
create table if not exists public.lesson_hadith (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  hadith_id uuid not null references public.hadith(id) on delete cascade,
  sort_order int not null default 0,
  unique(lesson_id, hadith_id)
);

alter table public.lesson_hadith enable row level security;
create policy "lesson_hadith_public_read"
  on public.lesson_hadith for select using (true);

-- =============================================================
-- 6. USER LESSON PROGRESS
-- =============================================================
create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

alter table public.user_lesson_progress enable row level security;

create policy "user_lesson_progress_select_own"
  on public.user_lesson_progress for select
  using (auth.uid() = user_id);

create policy "user_lesson_progress_insert_own"
  on public.user_lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "user_lesson_progress_update_own"
  on public.user_lesson_progress for update
  using (auth.uid() = user_id);

-- =============================================================
-- 7. PROMO CODES
-- =============================================================
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('referral', 'friends_family', 'campaign')),
  duration_days int not null default 30,
  max_redemptions int not null default 1,
  redeemed_count int not null default 0,
  created_by_user_id uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

create policy "promo_codes_select_active"
  on public.promo_codes for select
  using (active = true);

create policy "promo_codes_insert_own"
  on public.promo_codes for insert
  with check (auth.uid() = created_by_user_id);

-- =============================================================
-- 8. REDEMPTIONS
-- =============================================================
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.promo_codes(code) on delete cascade,
  redeemed_by_user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique(code, redeemed_by_user_id)
);

alter table public.redemptions enable row level security;

create policy "redemptions_select_own"
  on public.redemptions for select
  using (auth.uid() = redeemed_by_user_id);

create policy "redemptions_insert_own"
  on public.redemptions for insert
  with check (auth.uid() = redeemed_by_user_id);

-- =============================================================
-- 9. REDEEM CODE FUNCTION (atomic)
-- =============================================================
create or replace function public.redeem_promo_code(p_code text)
returns json as $$
declare
  v_promo public.promo_codes;
  v_already_redeemed boolean;
  v_new_premium_until timestamptz;
begin
  -- Find the code
  select * into v_promo
  from public.promo_codes
  where code = p_code and active = true;

  if not found then
    return json_build_object('success', false, 'error', 'Invalid or expired code');
  end if;

  -- Check expiry
  if v_promo.expires_at is not null and v_promo.expires_at < now() then
    return json_build_object('success', false, 'error', 'This code has expired');
  end if;

  -- Check max redemptions
  if v_promo.redeemed_count >= v_promo.max_redemptions then
    return json_build_object('success', false, 'error', 'This code has reached its redemption limit');
  end if;

  -- Check if user already redeemed this code
  select exists(
    select 1 from public.redemptions
    where code = p_code and redeemed_by_user_id = auth.uid()
  ) into v_already_redeemed;

  if v_already_redeemed then
    return json_build_object('success', false, 'error', 'You have already redeemed this code');
  end if;

  -- Record redemption
  insert into public.redemptions (code, redeemed_by_user_id)
  values (p_code, auth.uid());

  -- Increment counter
  update public.promo_codes
  set redeemed_count = redeemed_count + 1
  where code = p_code;

  -- Extend premium
  select greatest(coalesce(premium_until, now()), now()) + (v_promo.duration_days || ' days')::interval
  into v_new_premium_until
  from public.profiles
  where id = auth.uid();

  update public.profiles
  set premium_until = v_new_premium_until
  where id = auth.uid();

  return json_build_object(
    'success', true,
    'premium_until', v_new_premium_until,
    'days_added', v_promo.duration_days
  );
end;
$$ language plpgsql security definer;

-- =============================================================
-- 10. SEED: 4 LEARNING PATHS
-- =============================================================
insert into public.learning_paths (title, description, difficulty, icon, lesson_count, sort_order) values
  ('Foundations of Faith', 'Essential hadith on the pillars of Islam, sincerity of intention, and core beliefs every Muslim should know.', 'beginner', 'heart-outline', 12, 1),
  ('Daily Practice', 'Hadith covering prayer, dhikr, dua, and the Prophetic routine for morning to evening.', 'intermediate', 'sunny-outline', 15, 2),
  ('Character & Conduct', 'The Prophet''s guidance on kindness, patience, honesty, family, and social relationships.', 'advanced', 'people-outline', 18, 3),
  ('Scholars'' Deep Dive', 'Advanced study of hadith sciences, chains of narration, and cross-collection analysis.', 'scholar', 'school-outline', 20, 4)
on conflict do nothing;
