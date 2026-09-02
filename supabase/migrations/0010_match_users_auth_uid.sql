-- Hardening: match_users(p_user_id, p_limit) let any authenticated caller
-- pass an arbitrary p_user_id and get matches computed "as" that user
-- (including their connections-exclusion list, evaluated under the
-- caller's own RLS view of user_connections - not necessarily correct for
-- the impersonated user). Not currently exploitable for reading extra
-- preference data (user_preferences already grants "select using (true)"
-- to all authenticated users - see 0001_init.sql), but an RPC parameter
-- that lets you run a "for user X" computation as a different X than
-- yourself is bad practice regardless, and would silently reopen a hole
-- if user_prefs read is ever tightened later. Fix: derive identity from
-- auth.uid() inside the function instead of trusting a client-supplied
-- uuid.

drop function if exists public.match_users(uuid, int);

create or replace function public.match_users(p_limit int default 20)
returns table (
  user_id uuid, username text, avatar_url text, bio text,
  score numeric, genre_score numeric, type_score numeric,
  author_score numeric, freq_score numeric, format_score numeric, time_score numeric,
  shared_genres text[]
) language sql stable security invoker as $$
  with me as (select * from user_preferences where user_id = auth.uid()),
  candidates as (
    select up.*, p.username, p.avatar_url, p.bio
    from user_preferences up
    join profiles p on p.id = up.user_id
    where up.user_id <> auth.uid()
      and not exists (  -- exclude existing connections either direction
        select 1 from user_connections uc
        where (uc.user_id = auth.uid() and uc.connected_user_id = up.user_id)
           or (uc.user_id = up.user_id and uc.connected_user_id = auth.uid()))
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

grant execute on function public.match_users(int) to authenticated;
