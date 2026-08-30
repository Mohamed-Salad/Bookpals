-- Phase 6.1: chat schema (Supabase Realtime, replacing Stream). Applied
-- directly to the live project via Supabase MCP on 2026-08-30 (see
-- DB-AUDIT-LOG.md) - this file mirrors that change for local history;
-- it does not need to be run again.
--
-- Uses a SECURITY DEFINER helper for membership checks specifically to
-- avoid the RLS self-recursion trap fixed in 0007 (a naive "exists
-- (select from conversation_members where ...)" policy placed directly
-- on conversation_members recurses the same way "Only moderators can
-- manage members" did on community_members).

create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  is_group   boolean default false,
  name       text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid references public.conversations (id) on delete cascade,
  user_id         uuid references public.profiles (id) on delete cascade,
  joined_at       timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations (id) on delete cascade,
  sender_id       uuid references public.profiles (id),
  content         text not null,
  created_at      timestamptz default now()
);

alter table public.conversations       enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages            enable row level security;

-- SECURITY DEFINER bypasses RLS *inside this function's own query*, so
-- calling it from a policy on conversation_members doesn't re-trigger
-- that table's RLS and recurse. search_path pinned per Supabase's
-- function hardening guidance (also fixes the same advisory warning
-- already present on jaccard/freq_adjacency/match_users).
create or replace function public.is_conversation_member(p_conversation_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from conversation_members
    where conversation_id = p_conversation_id and user_id = p_user_id
  );
$$;

grant execute on function public.is_conversation_member(uuid, uuid) to authenticated;

create policy "conversations read" on public.conversations
  for select to authenticated
  using (is_conversation_member(id, auth.uid()));

create policy "conversations insert" on public.conversations
  for insert to authenticated
  with check (auth.uid() = created_by);

create policy "conversation_members read" on public.conversation_members
  for select to authenticated
  using (is_conversation_member(conversation_id, auth.uid()));

-- Allows self-join (accepting/creating your own membership row) OR an
-- existing member adding someone else (group creation flow).
create policy "conversation_members insert" on public.conversation_members
  for insert to authenticated
  with check (auth.uid() = user_id or is_conversation_member(conversation_id, auth.uid()));

create policy "messages read" on public.messages
  for select to authenticated
  using (is_conversation_member(conversation_id, auth.uid()));

create policy "messages insert" on public.messages
  for insert to authenticated
  with check (auth.uid() = sender_id and is_conversation_member(conversation_id, auth.uid()));

alter publication supabase_realtime add table messages;
