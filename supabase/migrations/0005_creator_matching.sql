-- Phase 5.3: creator matching bonus. Requires 0002_matching.sql (defines
-- match_users) and 0004_creators.sql (creator_profiles table) applied
-- first. Run once against the live project.
--
-- Adds a new output column (is_creator) to match_users, which Postgres
-- doesn't allow via CREATE OR REPLACE (return-type/signature change) -
-- has to be dropped and recreated. Same body as 0002's version plus:
-- (a) is_creator flag per candidate, (b) +0.10 bonus when the candidate
-- is a creator sharing >=1 genre with the seeker, (c) total score capped
-- at 1.0 so the bonus can't push a near-perfect match over 100%.

drop function if exists public.match_users(uuid, int);

create function public.match_users(p_user_id uuid, p_limit int default 20)
returns table (
  user_id uuid, username text, avatar_url text, bio text,
  score numeric, genre_score numeric, type_score numeric,
  author_score numeric, freq_score numeric, format_score numeric, time_score numeric,
  shared_genres text[], is_creator boolean
) language sql stable security invoker as $$
  with me as (select * from user_preferences where user_id = p_user_id),
  candidates as (
    select up.*, p.username, p.avatar_url, p.bio,
      exists(
        select 1 from creator_profiles cp where cp.user_id = up.user_id
      ) as is_creator
    from user_preferences up
    join profiles p on p.id = up.user_id
    where up.user_id <> p_user_id
      and not exists (  -- exclude existing connections either direction
        select 1 from user_connections uc
        where (uc.user_id = p_user_id and uc.connected_user_id = up.user_id)
           or (uc.user_id = up.user_id and uc.connected_user_id = p_user_id))
  )
  select c.user_id, c.username, c.avatar_url, c.bio,
    round(least((
      0.40 * coalesce(jaccard(c.favorite_genres, me.favorite_genres), 0)
    + 0.20 * coalesce((c.reading_type = me.reading_type)::int, 0)
    + 0.15 * coalesce(jaccard(c.favorite_authors, me.favorite_authors), 0)
    + 0.10 * freq_adjacency(c.reading_frequency, me.reading_frequency)
    + 0.10 * coalesce((c.preferred_reading_format = me.preferred_reading_format)::int, 0)
    + 0.05 * coalesce((c.preferred_reading_time = me.preferred_reading_time)::int, 0)
    + case
        when c.is_creator
         and coalesce(jaccard(c.favorite_genres, me.favorite_genres), 0) > 0
        then 0.10 else 0
      end
    ), 1.0)::numeric, 3) as score,
    -- expose components for "why you matched" UI (unaffected by the cap
    -- above - that only applies to the aggregate total)
    round(coalesce(jaccard(c.favorite_genres, me.favorite_genres),0)::numeric,3),
    coalesce((c.reading_type = me.reading_type)::int, 0)::numeric,
    round(coalesce(jaccard(c.favorite_authors, me.favorite_authors),0)::numeric,3),
    freq_adjacency(c.reading_frequency, me.reading_frequency)::numeric,
    coalesce((c.preferred_reading_format = me.preferred_reading_format)::int, 0)::numeric,
    coalesce((c.preferred_reading_time = me.preferred_reading_time)::int, 0)::numeric,
    coalesce((
      select array_agg(g) from unnest(coalesce(c.favorite_genres, '{}')) g
      where g = any(coalesce(me.favorite_genres, '{}'))
    ), '{}') as shared_genres,
    c.is_creator
  from candidates c, me
  order by score desc limit p_limit;
$$;

grant execute on function public.match_users(uuid, int) to authenticated;
