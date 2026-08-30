-- Phase 4.1b: secondary reading types + identity/role columns for the
-- multi-step onboarding flow (Task 4.2). Run once against the live project
-- (SQL Editor, or `supabase db push` once the project is linked).
--
-- All additive/nullable-or-defaulted - safe for existing rows. No RLS
-- changes needed: RLS is row-level, existing profiles/user_preferences
-- policies already cover these new columns.

alter table public.user_preferences
  add column if not exists secondary_types text[] default '{}';

alter table public.profiles
  add column if not exists pronouns     text,
  add column if not exists display_name text,
  add column if not exists role         text default 'reader';

alter table public.profiles
  add constraint profiles_role_check check (role in ('reader', 'creator', 'both'));
