-- Fixes conversation creation 403'ing with "new row violates row-level
-- security policy for table conversations" every time, confirmed 2026-09-07
-- (see DB-AUDIT-LOG.md for the full diagnosis). Root cause: Postgres RLS
-- requires an INSERT's RETURNING clause (what supabase-js's .insert().select()
-- compiles to) to also satisfy the table's SELECT policy, not just the
-- INSERT policy - and conversations' SELECT policy is
-- is_conversation_member(id, auth.uid()), which is false for a brand new
-- conversation until the creator's conversation_members row is inserted, a
-- separate, later client-side call. Confirmed directly: the exact same
-- insert succeeds without RETURNING and fails with it, even though the
-- INSERT policy's own condition (auth.uid() = created_by) was always true.
--
-- Fix: do the conversation insert AND both membership inserts atomically,
-- server-side, in a security definer function - same pattern already used
-- by is_conversation_member for exactly this class of RLS chicken-and-egg
-- problem. Bonus: also removes a pre-existing non-atomicity bug where a
-- failed second insert (into conversation_members) after a successful first
-- insert (into conversations) would have left an orphaned conversation row.

create or replace function public.create_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  insert into conversations (is_group, created_by)
  values (false, auth.uid())
  returning id into v_conversation_id;

  insert into conversation_members (conversation_id, user_id)
  values (v_conversation_id, auth.uid()), (v_conversation_id, p_other_user_id);

  return v_conversation_id;
end;
$$;

create or replace function public.create_group_conversation(p_name text, p_member_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  insert into conversations (is_group, name, created_by)
  values (true, p_name, auth.uid())
  returning id into v_conversation_id;

  insert into conversation_members (conversation_id, user_id)
  select v_conversation_id, member_id
  from (select distinct unnest(array_append(p_member_ids, auth.uid())) as member_id) d;

  return v_conversation_id;
end;
$$;

grant execute on function public.create_direct_conversation(uuid) to authenticated;
grant execute on function public.create_group_conversation(text, uuid[]) to authenticated;
