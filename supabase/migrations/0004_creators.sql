-- Phase 5.1: Creators space schema. Run once against the live project
-- (SQL Editor, or `supabase db push` once the project is linked).
-- RLS mirrors the existing pattern (0001_init.sql): read by any
-- authenticated user (public directory), write only your own rows.

create table if not exists public.creator_profiles (
  user_id        uuid primary key references public.profiles (id) on delete cascade,
  craft          text[] default '{}',  -- writer, illustrator, poet, translator, editor, narrator
  tagline        text,
  portfolio_url  text,
  open_to_collab boolean default false,
  created_at     timestamptz default now()
);

create table if not exists public.works (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid references public.creator_profiles (user_id) on delete cascade,
  title       text not null,
  work_type   text,
  blurb       text,
  link_url    text,
  cover_url   text,
  genres      text[] default '{}',
  created_at  timestamptz default now()
);

alter table public.creator_profiles enable row level security;
alter table public.works            enable row level security;

create policy "creator_profiles read"   on public.creator_profiles for select to authenticated using (true);
create policy "creator_profiles insert" on public.creator_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "creator_profiles update" on public.creator_profiles for update to authenticated using (auth.uid() = user_id);
create policy "creator_profiles delete" on public.creator_profiles for delete to authenticated using (auth.uid() = user_id);

create policy "works read"   on public.works for select to authenticated using (true);
create policy "works insert" on public.works for insert to authenticated with check (auth.uid() = creator_id);
create policy "works update" on public.works for update to authenticated using (auth.uid() = creator_id);
create policy "works delete" on public.works for delete to authenticated using (auth.uid() = creator_id);

-- Storage bucket for work cover images (public read, auth write) - new
-- policies scoped only to this bucket, existing avatars/community-banners/
-- dicussion-posts policies from 0001_init.sql untouched.
insert into storage.buckets (id, name, public) values
  ('work-covers', 'work-covers', true)
on conflict (id) do nothing;

create policy "work-covers public read"
  on storage.objects for select
  using (bucket_id = 'work-covers');

create policy "work-covers auth write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'work-covers');

create policy "work-covers auth update"
  on storage.objects for update to authenticated
  using (bucket_id = 'work-covers');
