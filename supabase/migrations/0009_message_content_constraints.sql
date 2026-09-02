-- Defense in depth for chat message content. Applied directly to the
-- live project via Supabase MCP (see DB-AUDIT-LOG.md) - this file
-- mirrors that change for local history; it does not need to be run
-- again.
--
-- The client already trims and requires non-empty text before sending,
-- but nothing stopped a caller bypassing the UI (direct API call with a
-- valid session) from inserting empty/whitespace-only or arbitrarily
-- huge content. RLS already restricts who can write (conversation
-- members only) - this restricts what they can write.
alter table public.messages
  add constraint messages_content_not_blank check (char_length(trim(content)) > 0),
  add constraint messages_content_length check (char_length(content) <= 4000);
