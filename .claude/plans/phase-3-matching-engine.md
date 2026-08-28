# Phase 3 — Matching Engine

**Status: not started.** See [00-STATUS.md](00-STATUS.md) for repo traps and the validation gate.
Note: `recommendations/MatchCard.jsx` was already scaffolded during Phase 2.3 with placeholder data —
Task 3.3 below wires it to real data instead of building it fresh.

### Task 3.1: Scoring RPC migration
- **Action**: new file `supabase/migrations/0002_matching.sql`. Function:

```sql
create or replace function public.match_users(p_user_id uuid, p_limit int default 20)
returns table (
  user_id uuid, username text, avatar_url text, bio text,
  score numeric, genre_score numeric, type_score numeric,
  author_score numeric, freq_score numeric, format_score numeric, time_score numeric
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
    + 0.20 * (c.reading_type = me.reading_type)::int
    + 0.15 * coalesce(jaccard(c.favorite_authors, me.favorite_authors), 0)
    + 0.10 * freq_adjacency(c.reading_frequency, me.reading_frequency)
    + 0.10 * (c.preferred_reading_format = me.preferred_reading_format)::int
    + 0.05 * (c.preferred_reading_time = me.preferred_reading_time)::int
    )::numeric, 3) as score,
    -- expose components for "why you matched" UI
    round(coalesce(jaccard(c.favorite_genres, me.favorite_genres),0)::numeric,3),
    (c.reading_type = me.reading_type)::int::numeric,
    round(coalesce(jaccard(c.favorite_authors, me.favorite_authors),0)::numeric,3),
    freq_adjacency(c.reading_frequency, me.reading_frequency)::numeric,
    (c.preferred_reading_format = me.preferred_reading_format)::int::numeric,
    (c.preferred_reading_time = me.preferred_reading_time)::int::numeric
  from candidates c, me
  order by score desc limit p_limit;
$$;
```

  Plus helpers in the same migration: `jaccard(text[], text[]) returns float` (`|A∩B| / |A∪B|`,
  null-safe) and `freq_adjacency(text, text) returns float` (equal→1, adjacent in
  Daily>Weekly>Occasionally>Rarely→0.5, else 0). Both `immutable`. Grant execute to `authenticated`.
- **Validate**: run in Supabase SQL editor with two seeded test users; scores 0–1.

### Task 3.2: Client rewrite
- **Action**: gut `src/services/recommendationService.js` → single
  `supabase.rpc("match_users", { p_user_id, p_limit })` call wrapped in a TanStack Query hook
  `useMatches(userId)`. Delete the old client-side scoring code.
- **Validate**: Home "Top matches" rail shows real scored users (seed 3+ test accounts with
  overlapping genres via the app's own signup + questionnaire).

### Task 3.3: Match UI
- **Action**: wire the existing `MatchCard` (scaffolded in Phase 2.3) to show score as %, top-2
  shared genres as Badges, and a breakdown popover ("Genres 0.8 · Type ✓ · Authors 0.2 …"). CTA =
  "Connect" → existing `sendFriendRequest`. Full `/matches` page listing top 20.
- **Validate**: connect flow end-to-end between two test accounts.
