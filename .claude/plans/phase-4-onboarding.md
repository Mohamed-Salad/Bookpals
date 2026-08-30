# Phase 4 — Inclusive Registration & Onboarding

**Status: DONE except one item.** 4.1a, 4.1b, 4.2, and most of 4.3 done 2026-08-30.
`0003_inclusive.sql` applied and verified live (REST probe, see DB-AUDIT-LOG.md).
See [00-STATUS.md](00-STATUS.md) for repo traps and the validation gate.

### Task 4.1a: Broaden the taxonomy — DONE
`src/utils/questions.js` `READING_TYPES`/`GENRES`/`READING_FORMATS` expanded, driven by the user
wanting the platform to cover "every literary reader whether online or not," not just the plan's
original narrower list. Pure client-side change — `reading_type` is `text` and `favorite_genres` is
already `text[]`, so no migration needed.
- READING_TYPES += Web Fiction/Serials, Fanfiction, Light Novels, Webtoons/Manhwa, Audiobooks &
  Podcasts, Interactive Fiction/Visual Novels, Zines & Indie Press. (Dropped "Poetry" from this list —
  the original plan listed it as both a reading *type* and already-existing *genre*, same word in two
  categories; kept it only as a genre.)
- GENRES += LGBTQ+ Voices, Disability & Neurodivergent Voices, World Literature (Translated),
  Mythology & Folklore, Religious & Spiritual (additive alongside existing "Christian," not a
  replacement — renaming would silently orphan any user's already-stored value), True Crime,
  Literary Fiction, Cookbooks & Food Writing, Nature & Environmental Writing, LitRPG/GameLit, War &
  Military Fiction, Western, Politics & Current Affairs, Adult (user's call, PG-plain label over
  "Erotica" — asked and confirmed 2026-08-30, see chat).
- READING_FORMATS += Web/App (previously unrepresented despite being how most online-native readers
  actually read), Large Print.
- Matching algorithm needed zero code changes — `reading_type`/`favorite_genres` scoring is plain
  string comparison, generalizes to any list. Build green.

### Task 4.1b: `secondary_types` + profile columns — DONE, migration applied
- `supabase/migrations/0003_inclusive.sql` written: `user_preferences.secondary_types text[]`,
  `profiles.pronouns/display_name/role` (role check-constrained to reader/creator/both). All
  additive/nullable-or-defaulted, safe for existing rows.
- `questions.js`: new optional multi-select question ("Any other ways you read?"), renders
  automatically since `Interests.jsx` is data-driven off `READING_QUESTIONS`.
- `database.js` `createPreferences` now includes `secondary_types` in its upsert unconditionally.
- Migration applied by Mr Salad 2026-08-30; verified via read-only REST probes on both tables
  (`profiles?select=role,pronouns,display_name`, `user_preferences?select=secondary_types`, both
  `200 []` — columns exist, RLS correctly blocks anon reads). `/interests` and `/onboarding` unblocked.

### Task 4.2: Multi-step onboarding — DONE
New `/onboarding`: welcome (display name + optional pronouns) → role (reader/creator/both) → reading
preferences → suggested communities (`RecommendedCommunities`, reused as-is). Each step saves as it
goes, so leaving mid-flow doesn't lose earlier answers. `Signup.jsx` now routes new users to
`/onboarding` instead of `/interests`; `Login.jsx` checks for an existing `user_preferences` row and
routes first-time logins to `/onboarding`, returning users straight to `/home`.

Extracted the question-rendering logic out of `Interests.jsx` into a shared `PreferencesForm`
component (restyled onto Phase 2 tokens/ui primitives), reused both standalone (`/interests`, edit
preferences any time) and as the wizard's step 3 — same save path, different `onComplete` callback.
Note: this overwrote an old, already-dead `PreferencesForm.jsx` that existed at the same path
(different prop shape, confirmed unused anywhere via `git grep` at `HEAD` before overwriting, same
pattern as other orphaned files found this session) — should have `Read` it first rather than assuming
a fresh file; got lucky it was dead code.

- **Validate**: fresh signup lands in onboarding; completing it lands on Home with matches; skipping
  optional fields works. Migration's applied now — only blocker left is a logged-in pass (this session
  has no Supabase login).

### Task 4.3: A11y pass — mostly DONE
- Form fields labelled: already satisfied — `ui/Input` renders a proper `<label htmlFor>` by default,
  used throughout.
- Buttons have discernible text: already satisfied, no icon-only buttons without text in touched code.
- Focus order: natural DOM order throughout, no issues found.
- **Color contrast — DONE, real bugs found and fixed.** Computed actual ratios: white text on
  `bg-accent` ≈3.2:1 (needs 4.5:1) and `text-accent` directly on paper/surface ≈3.0:1 (fails even the
  lenient 3:1 threshold) — both real failures in light mode, app-wide (Button, Tabs, links, Navbar
  brand text, Landing CTA, Avatar initials, and this phase's own new components). Fixed by swapping to
  `accent-dark` (≈5.0:1 / ≈4.7:1) everywhere — no new color tokens needed. Dark mode's text-on-paper
  case was already fine (≈8.6:1, computed, not touched). **Not fully solved**: dark mode's solid-fill
  white-text case improves but doesn't reach 4.5:1 without a third accent shade specific to that
  combination — would need visual verification in dark mode to pick a value with confidence, not
  guessed at blind.
- **`prefers-reduced-motion` — NOT done.** Touches 7+ files using `framer-motion` transitions
  (`src/utils/animations.js` exports `fadeIn`/`slideIn`/`scaleIn`/etc., all fairly subtle ~20px/opacity
  transitions, not large/parallax). WCAG AAA-level, not the AA bar the contrast fix targeted; needs
  OS-level motion-preference emulation to verify, which wasn't done this session. Genuine remaining
  item, not skipped for lack of importance — just not rushed blind.
- **Validate**: keyboard-only signup → onboarding → post creation succeeds. Not yet done — needs a
  real logged-in pass (this session has no Supabase login).
