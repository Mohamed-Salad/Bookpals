# Phase 3 — Matching Engine

**Note**: `match_users` (defined here by `0002_matching.sql`) was later modified by Phase 5's
`0005_creator_matching.sql` — dropped and recreated with an added `is_creator` column and a creator
bonus term. See phase-5-creators.md Task 5.3. This file describes the original version.

**Status: DONE.** Migration applied by Mr Salad 2026-08-30 via the Supabase SQL Editor; verified live
by this session with a read-only RPC probe (see DB-AUDIT-LOG.md). See [00-STATUS.md](00-STATUS.md)
for repo traps, the validation gate, and a minor non-urgent hardening note (anon-role EXECUTE grant).
**Still open**: a real logged-in pass to eyeball actual scored matches.

### Task 3.1: Scoring RPC migration — DONE, applied and verified live
- **Action**: new file `supabase/migrations/0002_matching.sql`. Function:

```sql
create or replace function public.match_users(p_user_id uuid, p_limit int default 20)
returns table (
  user_id uuid, username text, avatar_url text, bio text,
  score numeric, genre_score numeric, type_score numeric,
  author_score numeric, freq_score numeric, format_score numeric, time_score numeric,
  shared_genres text[]
) language sql stable security invoker as $$
  with me as (select * from user_preferences where user_id = p_user_id),
  candidates as (
    select up.*, p.username, p.avatar_url, p.bio
    from user_preferences up
    join profiles p on p.id = up.user_id
    where up.user_id <> p_user_id
      and not exists (  -- exclude existing connections either direction
        select 1 from user_connections uc
        where (uc.user_id = p_user_id and uc.connected_user_id = up.user_id)
           or (uc.user_id = up.user_id and uc.connected_user_id = p_user_id))
  )
  select c.user_id, c.username, c.avatar_url, c.bio,
    round((
      0.40 * coalesce(jaccard(c.favorite_genres, me.favorite_genres), 0)
    + 0.20 * coalesce((c.reading_type = me.reading_type)::int, 0)
    + 0.15 * coalesce(jaccard(c.favorite_authors, me.favorite_authors), 0)
    + 0.10 * freq_adjacency(c.reading_frequency, me.reading_frequency)
    + 0.10 * coalesce((c.preferred_reading_format = me.preferred_reading_format)::int, 0)
    + 0.05 * coalesce((c.preferred_reading_time = me.preferred_reading_time)::int, 0)
    )::numeric, 3) as score,
    -- expose components for "why you matched" UI
    round(coalesce(jaccard(c.favorite_genres, me.favorite_genres),0)::numeric,3),
    coalesce((c.reading_type = me.reading_type)::int, 0)::numeric,
    round(coalesce(jaccard(c.favorite_authors, me.favorite_authors),0)::numeric,3),
    freq_adjacency(c.reading_frequency, me.reading_frequency)::numeric,
    coalesce((c.preferred_reading_format = me.preferred_reading_format)::int, 0)::numeric,
    coalesce((c.preferred_reading_time = me.preferred_reading_time)::int, 0)::numeric,
    coalesce((
      select array_agg(g) from unnest(coalesce(c.favorite_genres, '{}')) g
      where g = any(coalesce(me.favorite_genres, '{}'))
    ), '{}') as shared_genres
  from candidates c, me
  order by score desc limit p_limit;
$$;
```

  Plus helpers in the same migration: `jaccard(text[], text[]) returns float` (`|A∩B| / |A∪B|`,
  null-safe) and `freq_adjacency(text, text) returns float` (equal→1, adjacent in
  Daily>Weekly>Occasionally>Rarely→0.5, else 0). Both `immutable`. Grant execute to `authenticated`.
- **Two corrections made while writing the migration** (not yet run, so cheap to fix before they'd
  have been live bugs): (1) the raw `(a = b)::int` equality terms return `NULL` — not `false` — when
  either side is `NULL`, and `reading_type`/`preferred_reading_format`/`preferred_reading_time` are
  nullable columns, so a partially-completed questionnaire would have silently `NULL`'d out a user's
  entire score via arithmetic propagation. Every equality term is now `coalesce(..., 0)`-wrapped, same
  pattern the jaccard terms already used. (2) added a `shared_genres text[]` return column (the actual
  intersected genre list) — the original design only exposed `genre_score` (a similarity float), which
  isn't enough to render Task 3.3's "top-2 shared genres as Badges."
- **Validate**: run in Supabase SQL editor with two seeded test users; scores 0–1. Technical
  existence/permissions verified via anon-key REST probe (200, empty result — correct for a
  nonexistent user, RLS blocks anon reads as expected). **Real scored-users check still open** —
  needs two real accounts with overlapping preferences and a logged-in session.

### Task 3.2: Client rewrite — DONE
`src/services/recommendationService.js` gutted to `useMatches(userId, limit)`, a TanStack Query hook
wrapping `supabase.rpc("match_users", ...)`. Old client-side scoring code deleted. `getRecommendedCommunities`
untouched (Task 3 doesn't touch community recommendations). Found while wiring this up:
`RecommendedUsers.jsx`/`RecommendedUserCard.jsx` (the old consumers of the client-scored function)
were unused anywhere in the live app — dead code, deleted rather than migrated.

### Task 3.3: Match UI — DONE (client-side; blocked at runtime until 3.1's SQL is applied)
`MatchCard` rewritten to take the full `match_users` row: score badge, a Headless UI `Popover`
breakdown (genres/type/authors/frequency/format/time — already an installed dependency, no new one
added), shared-genre Badges, and a "Connect" button wired to `sendFriendRequest` that invalidates the
`["matches"]` query on success (the RPC already excludes anyone with an existing connection row, so a
sent user simply drops out of the list on refetch - no separate "pending" status check needed). Full
`/matches` page added, routed, and added to the Sidebar nav (was a disabled placeholder). Sidebar was
previously only shown on Home/CommunityView; added `/matches` to that list too so the page is
reachable/coherent - Discover/Communities/Profile/Search still lack the sidebar, a pre-existing Phase
2.3 gap not fixed here (out of scope for matching engine work).
- **Validate**: connect flow end-to-end between two test accounts. Migration's applied now — only
  blocker left is a logged-in pass (this session has no Supabase login).
