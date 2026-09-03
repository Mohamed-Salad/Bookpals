-- Fixes a regression from 0010_match_users_auth_uid.sql: that migration
-- rewrote match_users to derive identity from auth.uid() instead of a
-- client-supplied p_user_id (a real security fix - see its own comment),
-- but was based on 0002_matching.sql's original body and didn't notice
-- the function had already been upgraded once since then, by
-- 0005_creator_matching.sql, which added:
--   (a) an is_creator output column
--   (b) a +0.10 score bonus when the candidate is a creator sharing >=1
--       genre with the seeker
--   (c) the total score capped at 1.0 so that bonus can't push a
--       near-perfect match over 100%
-- 0010 silently dropped all three. MatchCard.jsx still reads `is_creator`
-- to show a "Creator you may like" badge - it's been getting undefined
-- (falsy) since 0010 was applied, so the badge stopped appearing and the
-- creator bonus stopped being scored, for anyone. This restores 0005's
-- logic on top of 0010's auth.uid() fix rather than reverting the fix.

drop function if exists public.match_users(int);

create or replace function public.match_users(p_limit int default 20)
returns table (
  user_id uuid, username text, avatar_url text, bio text,
  score numeric, genre_score numeric, type_score numeric,
  author_score numeric, freq_score numeric, format_score numeric, time_score numeric,
  shared_genres text[], is_creator boolean
) language sql stable security invoker as $$
  with me as (select * from user_preferences where user_id = auth.uid()),
  candidates as (
    select up.*, p.username, p.avatar_url, p.bio,
      exists(
        select 1 from creator_profiles cp where cp.user_id = up.user_id
      ) as is_creator
    from user_preferences up
    join profiles p on p.id = up.user_id
    where up.user_id <> auth.uid()
      and not exists (  -- exclude existing connections either direction
        select 1 from user_connections uc
        where (uc.user_id = auth.uid() and uc.connected_user_id = up.user_id)
           or (uc.user_id = up.user_id and uc.connected_user_id = auth.uid()))
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

grant execute on function public.match_users(int) to authenticated;
