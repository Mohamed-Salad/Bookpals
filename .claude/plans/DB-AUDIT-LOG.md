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
