# Phase 5 — Creators Space

**Status: DONE, two migrations not yet applied.** See [00-STATUS.md](00-STATUS.md) for repo traps
and the validation gate.

### Task 5.1: Schema — DONE, migration not yet applied
`supabase/migrations/0004_creators.sql`: `creator_profiles` (craft, tagline, portfolio_url,
open_to_collab) and `works` (title, work_type, blurb, link_url, cover_url, genres), RLS mirroring the
existing read-all/write-own pattern. New `work-covers` storage bucket, policies scoped only to it.
- **Validate**: SQL runs clean on live project. **Not yet done.**

### Task 5.2: Creators directory + profile tab — DONE
`/creators`: grid of `CreatorCard` (avatar, craft badges, tagline, top work), filterable by craft
(button group) and genre (select, against the full expanded GENRES list). New
`services/creatorService.js`: creator profile CRUD, works CRUD, cover upload (mirrors the avatar-
upload pattern in `database.js`). Profile page gains a "Creator" tab (Radix `Tabs`, only shown when
`role in ('creator','both')`) — edit craft/tagline/portfolio/open-to-collab, publish/delete works with
genre tags and an optional cover image. Sidebar "Creators" link goes live; `/creators` added to the
shell's sidebar-visible pages (same reasoning as Phase 3's `/matches` — a primary nav destination
should keep you in the shell).
- **Validate**: creator account can publish a work; reader account can browse/filter. **Not yet
  done — needs 5.1's migration applied, then a logged-in pass** (this session has no Supabase login).

### Task 5.3: Matching bonus — DONE, migration not yet applied
`supabase/migrations/0005_creator_matching.sql`: `match_users` gets `+0.10` when a candidate is a
creator sharing ≥1 genre with the seeker, total capped at 1.0. Adds an `is_creator` output column,
which required `drop function` + recreate — `CREATE OR REPLACE` can't change a `returns table(...)`
signature. **Depends on 0002 (already live) and 0004 (Task 5.1, not yet applied) both being live
first** — references the `creator_profiles` table. `MatchCard` shows a "Creator you may like" badge
when `is_creator` is true.
- **Validate**: creator with shared genres outranks equivalent non-creator. **Not yet done.**

## Applying both pending migrations

Run in this exact order (0005 depends on 0004's `creator_profiles` table existing):
1. `supabase/migrations/0004_creators.sql`
2. `supabase/migrations/0005_creator_matching.sql`
