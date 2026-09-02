# Live Supabase Actions — Audit Log

Every action taken against the **live** Supabase project (not local files) gets an entry here,
oldest first: what ran, why, and the result. Read-only checks count too. This exists because DB
mutations are the one class of action in this repo that isn't recoverable via `git revert`.

---

**2026-08-28** — Read-only REST probe, not MCP (no DB access tool was available at the time).
`curl POST {project}/rest/v1/rpc/match_users` with the anon key, body
`{"p_user_id":"00000000-...","p_limit":1}`, to check whether `0002_matching.sql` had been applied.
Result: `404 PGRST202` — function does not exist. No mutation, confirmed migration still pending.

**2026-08-30** — User reported Supabase MCP reconnected. Checked via `ToolSearch` for any
`supabase`-named tool; none found. Told the user before taking any DB action rather than assuming
access — action deferred pending confirmation.

**2026-08-30** — Still no MCP DB tool available. Gave the user the full text of
`0002_matching.sql`; they ran it manually via the Supabase SQL Editor (their action, not mine).
Verified after with the same read-only REST probe as the first entry: `POST .../rpc/match_users`
with `p_user_id: 00000000-...`, anon key. Result: `200 []` — function exists, executes cleanly,
returns no rows for a nonexistent user (correct). No mutation performed by this session; read-only
confirmation only. Phase 3 migration is now live.

**2026-08-30** — Gave the user the full text of `0003_inclusive.sql`; they ran it manually via the
Supabase SQL Editor (their action, not mine). Verified after with read-only REST probes: `GET
.../profiles?select=role,pronouns,display_name&limit=1` and `GET
.../user_preferences?select=secondary_types&limit=1`, anon key. Both `200 []` — PostgREST validates
requested columns against schema before RLS applies, so a 200 (vs a 400 "column does not exist")
confirms all four new columns exist; empty result is RLS correctly blocking anon reads, not an
error. No mutation performed by this session. Phase 4.1b migration is now live; /interests and
/onboarding are unblocked.

**2026-08-30** — Applied Phase 6.1's chat schema directly via MCP `apply_migration` (name:
`chat_schema`): `conversations`/`conversation_members`/`messages` tables, RLS, and a
`security definer` `is_conversation_member()` helper (deliberately avoiding the exact self-recursion
pattern just fixed on `community_members` — see the entry above and 0007). Verified after via
`list_tables`: all three tables present, RLS enabled, 0 rows (expected, nothing seeded). Local mirror:
`0008_chat.sql` (does not need to be re-run).

**2026-08-30** — Supabase MCP became available mid-session (confirmed via `list_projects`; project
`BookPals` = `nfhkdwwydzigdojikzeu`). First live-write action performed directly by this session
rather than handed to the user: user ran the fixed `0006_seed_webnovel_communities.sql` successfully,
but then reported seeing nothing in the app. Diagnosed via MCP `execute_sql` (read-only): a REST probe
for `communities` returned `500 42P17 infinite recursion detected in policy for relation
"community_members"`. Read `pg_policies` for both tables (read-only) — found a `community_members`
policy ("Only moderators can manage members", cmd=ALL) whose USING clause subqueried
`community_members` from within itself, triggered transitively by a `communities` SELECT via the
"Communities are viewable by everyone" policy. Confirmed via `grep` that nothing in the app references
"moderator". Applied the fix via MCP `apply_migration` (name: `fix_community_members_rls_recursion`):
`drop policy if exists "Only moderators can manage members" on public.community_members;`. Verified
after: `execute_sql` confirmed all 7 seeded communities exist and are correctly formed. Ran
`get_advisors` (security) as a post-DDL sanity check per the MCP server's own guidance — only
pre-existing, unrelated platform warnings (function search_path hardening, leaked-password-protection
toggle, a Postgres patch upgrade), nothing new from this change. Local mirror of the applied fix:
`0007_fix_community_members_rls_recursion.sql` (does not need to be re-run).

**2026-08-30** — User asked whether 0004/0005 had been run; unclear from context, so checked directly
via MCP rather than guessing. `list_tables`: `creator_profiles` and `works` both exist (0 rows,
tables present — confirms 0004). `select pg_get_function_result(oid) ... where proname='match_users'`:
return type includes `is_creator boolean` (confirms 0005 — that column only exists after 0005's
drop+recreate). Both migrations are live. Read-only checks only, no mutation.

**2026-09-02** — User asked for "secure text controls" on chat. Audited the composer/render path
first: confirmed no `dangerouslySetInnerHTML` anywhere in src/ (XSS-safe by default via React's JSX
escaping). Found two real gaps: no length cap and no server-side guard against empty/whitespace-only
content — RLS restricts *who* can write messages but not *what*. Applied via MCP `apply_migration`
(name: `message_content_constraints`): `messages_content_not_blank`
(`char_length(trim(content)) > 0`) and `messages_content_length` (`char_length(content) <= 4000`).
Client (`Conversation.jsx`) updated to match: `maxLength={4000}` on the input, a counter past 90%,
and a friendly error message on send failure. Local mirror: `0009_message_content_constraints.sql`.
