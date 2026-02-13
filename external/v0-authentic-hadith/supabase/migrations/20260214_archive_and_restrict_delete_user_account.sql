-- Archive-first delete_user_account RPC
create table if not exists public.archived_user_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  archived_at timestamptz default now(),
  data jsonb not null
);

create or replace function public.delete_user_account(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_data jsonb := '{}'::jsonb;
  v_exists boolean;
begin
  -- profiles
  select to_regclass('public.profiles') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'profiles',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.profiles where id = p_user_id) t)
    );
  end if;

  -- saved_collections
  select to_regclass('public.saved_collections') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'saved_collections',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.saved_collections where user_id = p_user_id) t)
    );
  end if;

  -- saved_hadith (singular)
  select to_regclass('public.saved_hadith') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'saved_hadith',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.saved_hadith where user_id = p_user_id) t)
    );
  end if;

  -- saved_hadiths (plural)
  select to_regclass('public.saved_hadiths') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'saved_hadiths',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.saved_hadiths where user_id = p_user_id) t)
    );
  end if;

  -- subscriptions
  select to_regclass('public.subscriptions') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'subscriptions',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.subscriptions where user_id = p_user_id) t)
    );
  end if;

  -- sahaba_reading_progress
  select to_regclass('public.sahaba_reading_progress') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'sahaba_reading_progress',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.sahaba_reading_progress where user_id = p_user_id) t)
    );
  end if;

  -- user_streaks
  select to_regclass('public.user_streaks') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'user_streaks',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_streaks where user_id = p_user_id) t)
    );
  end if;

  -- some_table (generic)
  select to_regclass('public.some_table') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'some_table',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.some_table where user_id = p_user_id) t)
    );
  end if;

  -- user_folders, user_settings, user_ai_queries (if present)
  select to_regclass('public.user_folders') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'user_folders',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_folders where user_id = p_user_id) t)
    );
  end if;

  select to_regclass('public.user_settings') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'user_settings',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_settings where user_id = p_user_id) t)
    );
  end if;

  select to_regclass('public.user_ai_queries') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object(
      'user_ai_queries',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_ai_queries where user_id = p_user_id) t)
    );
  end if;

  -- Insert snapshot
  insert into public.archived_user_data(user_id, data) values (p_user_id, v_data);

  -- Delete rows from known tables (only if they exist)
  if to_regclass('public.user_ai_queries') is not null then
    execute format('delete from public.user_ai_queries where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.subscriptions') is not null then
    execute format('delete from public.subscriptions where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.saved_hadith') is not null then
    execute format('delete from public.saved_hadith where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.saved_hadiths') is not null then
    execute format('delete from public.saved_hadiths where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.saved_collections') is not null then
    execute format('delete from public.saved_collections where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.user_folders') is not null then
    execute format('delete from public.user_folders where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.user_settings') is not null then
    execute format('delete from public.user_settings where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.sahaba_reading_progress') is not null then
    execute format('delete from public.sahaba_reading_progress where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.user_streaks') is not null then
    execute format('delete from public.user_streaks where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.some_table') is not null then
    execute format('delete from public.some_table where user_id = %L', p_user_id::text);
  end if;
  if to_regclass('public.profiles') is not null then
    execute format('delete from public.profiles where id = %L', p_user_id::text);
  end if;
end;
$$;

-- restrict execution
revoke execute on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to service_role;
