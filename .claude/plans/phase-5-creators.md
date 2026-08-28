# Phase 5 — Creators Space

**Status: not started.** See [00-STATUS.md](00-STATUS.md) for repo traps and the validation gate.

### Task 5.1: Schema
- **Action**: `supabase/migrations/0004_creators.sql`:
  `creator_profiles(user_id uuid pk references profiles, craft text[] /* writer, illustrator, poet, translator, editor, narrator */, tagline text, portfolio_url text, open_to_collab boolean default false, created_at timestamptz default now())`;
  `works(id uuid pk default gen_random_uuid(), creator_id uuid references creator_profiles(user_id) on delete cascade, title text not null, work_type text, blurb text, link_url text, cover_url text, genres text[], created_at timestamptz default now())`.
  RLS mirroring existing patterns (read: authenticated; write: own rows). Storage bucket
  `work-covers` (public read, auth write).
- **Validate**: SQL runs clean on live project.

### Task 5.2: Creators directory + profile tab
- **Action**: `/creators` page: grid of creator cards (avatar, craft badges, tagline, top work),
  filter by craft + genre. Profile page gains a "Creator" tab (visible when
  `role in ('creator','both')`): edit creator_profile, CRUD works (cover upload reuses the existing
  avatar-upload pattern in `database.js` updateProfilePicture). Sidebar "Creators" link goes live.
- **Validate**: creator account can publish a work; reader account can browse/filter.

### Task 5.3: Matching bonus
- **Action**: `0005_creator_matching.sql`: in `match_users`, add
  `+ 0.10 * creator_genre_overlap` bonus term when candidate is a creator sharing ≥1 genre with the
  seeker (cap total at 1.0). Update breakdown UI with "Creator you may like" badge.
- **Validate**: creator with shared genres outranks equivalent non-creator.
