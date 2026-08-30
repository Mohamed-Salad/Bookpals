-- Seed: communities for popular web novels, so the "Web Fiction / Serials"
-- reading type (added in Phase 4.1a) has real content behind it on day one.
-- Titles/genres sourced from Royal Road's own trending page + well-known
-- long-running serials (Beware of Chicken, Defiance of the Fall, He Who
-- Fights with Monsters, Millennial Mage - all widely recognized in the
-- progression-fantasy/LitRPG web-fiction space), checked 2026-08-30.
-- Descriptions are broad-strokes premises, not scraped blurbs - kept
-- general to avoid stating specifics I can't verify precisely.
--
-- created_by is null (platform-curated, not any one user's community) -
-- the column is nullable, this is a supported case, not a workaround.
-- Run once against the live project (SQL Editor). Idempotent - safe to
-- re-run, `communities.name` is already unique.

insert into public.communities (name, description, genre, created_by) values
  (
    'Beware of Chicken Readers',
    'For fans of the slice-of-life cultivation comedy about a reincarnated engineer who just wants to farm peacefully - and the chicken raising itself right alongside him.',
    array['Fantasy', 'Humor and Comedy', 'LitRPG/GameLit'],
    null
  ),
  (
    'Defiance of the Fall Readers',
    'Discussion for the cultivation/apocalypse LitRPG where Earth is overrun by a monster-filled dungeon world and the protagonist has to grow strong enough to survive it.',
    array['Fantasy', 'Science Fiction', 'LitRPG/GameLit'],
    null
  ),
  (
    'He Who Fights with Monsters Readers',
    'For readers following the portal-fantasy LitRPG about a teacher pulled into another world and forced to master a bizarre, unpredictable magic system.',
    array['Fantasy', 'LitRPG/GameLit'],
    null
  ),
  (
    'Super Supportive Readers',
    'A community for the progression fantasy following a "support"-class hero out to prove non-combat magic can still save the world.',
    array['Science Fiction', 'LitRPG/GameLit'],
    null
  ),
  (
    'Cultivation System: Elder Edition Readers',
    'For fans of the cultivation LitRPG that hands its system to an older protagonist instead of the usual teenager, and follows him catching up the hard way.',
    array['Fantasy', 'LitRPG/GameLit'],
    null
  ),
  (
    'Sky Pride Readers',
    'Discussion for the wuxia/xianxia-flavored progression fantasy about martial ambition and climbing the cultivation ranks.',
    array['Fantasy', 'Mythology & Folklore'],
    null
  ),
  (
    'Millennial Mage Readers',
    'For readers of the modern-day witch story about balancing a day job with a secret double life as a spellcaster in a world where magic never fully vanished.',
    array['Fantasy', 'Paranormal'],
    null
  )
on conflict (name) do nothing;
