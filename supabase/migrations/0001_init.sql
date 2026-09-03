-- BookPals initial schema, reverse-engineered from src/services/*.js and components.
-- Run this once against a fresh Supabase project (SQL Editor, or `supabase db push`).
--
-- ponytail: RLS policies below are a permissive dev baseline — authenticated users
-- can read everything and write only their own rows. Tighten for GDPR before any
-- real deployment (per-column masking, stricter connection visibility, etc.).

-- ==========================================================================
-- Tables
-- ==========================================================================

-- Profiles: 1:1 with auth.users. createProfile() upserts {id, username, created_at}.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique not null,
  avatar_url   text,
  bio          text,
  reading_type text,
  created_at   timestamptz default now(),
  updated_at   timestamptz
);

-- Structured preferences (PreferencesForm) — read by recommendationService for matching.
create table if not exists public.user_preferences (
  user_id                  uuid primary key references public.profiles (id) on delete cascade,
  reading_type             text,
  reading_frequency        text,
  preferred_reading_time   text,
  preferred_reading_format text,
  favorite_genres          text[] default '{}',
  favorite_authors         text[] default '{}',
  reading_goals            text,
  created_at               timestamptz default now(),
  updated_at               timestamptz
);

-- Questionnaire answers (ReaderCategorization) — stored as a jsonb blob.
create table if not exists public.reader_preferences (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  preferences jsonb,
  updated_at  timestamptz default now()
);

-- Friend/connection graph. Rows are directional; accept creates a reciprocal row.
-- This table predates the migration system (created before this file ever ran),
-- so the `create table if not exists` below is a no-op against the live DB - it
-- documents the real live shape (confirmed via information_schema + pg_constraint
-- 2026-09-03: no id column, no ON DELETE CASCADE, composite PK, a status check
-- constraint) rather than the id/unique-constraint shape it had before that.
create table if not exists public.user_connections (
  user_id           uuid not null references public.profiles (id),
  connected_user_id uuid not null references public.profiles (id),
  status            text not null default 'pending',  -- pending | accepted | rejected | blocked
  created_at        timestamptz default timezone('utc'::text, now()),
  updated_at        timestamptz default timezone('utc'::text, now()),
  primary key (user_id, connected_user_id),
  constraint valid_status check (status = any (array['pending', 'accepted', 'rejected', 'blocked']))
);

-- Communities. `name unique` auto-names the constraint communities_name_key,
-- which CreateCommunityModal.jsx checks for by string. `genre` is an array,
-- `rules` is plain text (that's what the form submits).
create table if not exists public.communities (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  genre       text[] default '{}',
  rules       text,
  is_private  boolean default false,
  banner_url  text,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz default now()
);

create table if not exists public.community_members (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete cascade,
  role         text default 'member',  -- admin for creator
  joined_at    timestamptz default now(),
  unique (community_id, user_id)
);

-- Discussion posts. FK to profiles MUST be named discussions_user_id_fkey1 —
-- getCommunityDiscussions() embeds it as profiles!discussions_user_id_fkey1.
create table if not exists public.discussions (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities (id) on delete cascade,
  user_id      uuid,
  content      text,
  image_url    text,
  reactions    jsonb default '{}',
  created_at   timestamptz default now(),
  constraint discussions_user_id_fkey1
    foreign key (user_id) references public.profiles (id) on delete cascade
);

-- Comments (threaded via parent_comment_id, soft-deleted via is_deleted).
-- FK MUST be named comments_user_id_fkey1 — createComment() embeds it.
create table if not exists public.comments (
  id                uuid primary key default gen_random_uuid(),
  discussion_id     uuid references public.discussions (id) on delete cascade,
  user_id           uuid,
  content           text not null,
  parent_comment_id uuid references public.comments (id) on delete cascade,
  is_deleted        boolean default false,
  reactions         jsonb default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz,
  constraint comments_user_id_fkey1
    foreign key (user_id) references public.profiles (id) on delete cascade
);

-- ==========================================================================
-- Row Level Security
-- ==========================================================================
alter table public.profiles          enable row level security;
alter table public.user_preferences  enable row level security;
alter table public.reader_preferences enable row level security;
alter table public.user_connections   enable row level security;
alter table public.communities        enable row level security;
alter table public.community_members  enable row level security;
alter table public.discussions        enable row level security;
alter table public.comments           enable row level security;

-- profiles: readable by any signed-in user (public profiles); writable only by self.
create policy "profiles read"   on public.profiles for select to authenticated using (true);
create policy "profiles insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update" on public.profiles for update to authenticated using (auth.uid() = id);

-- preferences: readable by all authenticated (matching engine needs others' prefs); write own.
create policy "user_prefs read"  on public.user_preferences for select to authenticated using (true);
create policy "user_prefs write" on public.user_preferences for all    to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reader_prefs read"  on public.reader_preferences for select to authenticated using (auth.uid() = user_id);
create policy "reader_prefs write" on public.reader_preferences for all    to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- connections: visible to either party; you can only create rows as yourself.
create policy "conn read"   on public.user_connections for select to authenticated using (auth.uid() = user_id or auth.uid() = connected_user_id);
create policy "conn insert" on public.user_connections for insert to authenticated with check (auth.uid() = user_id);
create policy "conn update" on public.user_connections for update to authenticated using (auth.uid() = user_id or auth.uid() = connected_user_id);
create policy "conn delete" on public.user_connections for delete to authenticated using (auth.uid() = user_id or auth.uid() = connected_user_id);

-- communities: readable by all authenticated; created/edited by owner.
create policy "comm read"   on public.communities for select to authenticated using (true);
create policy "comm insert" on public.communities for insert to authenticated with check (auth.uid() = created_by);
create policy "comm update" on public.communities for update to authenticated using (auth.uid() = created_by);

-- memberships: visible to all; you manage your own membership.
create policy "member read"   on public.community_members for select to authenticated using (true);
create policy "member insert" on public.community_members for insert to authenticated with check (auth.uid() = user_id);
create policy "member delete" on public.community_members for delete to authenticated using (auth.uid() = user_id);

-- discussions: readable by all authenticated; authored/edited by self.
create policy "disc read"   on public.discussions for select to authenticated using (true);
create policy "disc insert" on public.discussions for insert to authenticated with check (auth.uid() = user_id);
create policy "disc update" on public.discussions for update to authenticated using (auth.uid() = user_id);
create policy "disc delete" on public.discussions for delete to authenticated using (auth.uid() = user_id);

-- comments: readable by all authenticated; authored/edited by self.
create policy "cmt read"   on public.comments for select to authenticated using (true);
create policy "cmt insert" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "cmt update" on public.comments for update to authenticated using (auth.uid() = user_id);
create policy "cmt delete" on public.comments for delete to authenticated using (auth.uid() = user_id);

-- ==========================================================================
-- Storage buckets (public read, authenticated write).
-- Bucket name 'dicussion-posts' is misspelled to match the code (database.js).
-- ==========================================================================
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('community-banners', 'community-banners', true),
  ('dicussion-posts', 'dicussion-posts', true)
on conflict (id) do nothing;

create policy "bucket public read"
  on storage.objects for select
  using (bucket_id in ('avatars', 'community-banners', 'dicussion-posts'));

create policy "bucket auth write"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'community-banners', 'dicussion-posts'));

create policy "bucket auth update"
  on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'community-banners', 'dicussion-posts'));
