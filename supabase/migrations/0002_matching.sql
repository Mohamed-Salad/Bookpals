-- Phase 3.1: matching engine RPC. Run once against the live project
-- (SQL Editor, or `supabase db push` once the project is linked).
--
-- Replaces the client-side scoring in recommendationService.js (Task 3.2
-- guts that file down to a single call to match_users below).

-- ==========================================================================
-- Helpers
-- ==========================================================================

-- Jaccard similarity: |A n B| / |A u B|. Null/empty-safe - returns null
-- (not a divide-by-zero error) when both arrays are empty; callers coalesce
-- that to 0.
create or replace function public.jaccard(a text[], b text[])
returns float
language sql
immutable
as $$
  select case
    when cardinality(coalesce(a, '{}') || coalesce(b, '{}')) = 0 then null
    else (
      select count(*)::float from unnest(coalesce(a, '{}')) x
      where x = any(coalesce(b, '{}'))
    ) / (
      select count(*)::float from (
        select unnest(coalesce(a, '{}')) as val
        union
        select unnest(coalesce(b, '{}'))
      ) u
    )
  end;
$$;

-- Reading-frequency adjacency on the fixed scale Daily > Weekly >
-- Occasionally > Rarely (src/utils/questions.js FREQUENCIES). Equal -> 1,
-- one step apart -> 0.5, else 0. Null-safe (returns 0, never null - unlike
-- jaccard this one isn't wrapped in coalesce() by the caller).
create or replace function public.freq_adjacency(a text, b text)
returns float
language sql
immutable
as $$
  select case
    when a is null or b is null then 0
    when a = b then 1
    when abs(
      array_position(array['Daily','Weekly','Occasionally','Rarely'], a) -
      array_position(array['Daily','Weekly','Occasionally','Rarely'], b)
    ) = 1 then 0.5
    else 0
  end;
$$;

-- ==========================================================================
-- match_users
-- ==========================================================================

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

grant execute on function public.match_users(uuid, int) to authenticated;
grant execute on function public.jaccard(text[], text[]) to authenticated;
grant execute on function public.freq_adjacency(text, text) to authenticated;
