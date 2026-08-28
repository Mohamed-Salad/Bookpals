# Phase 1 — Foundation & Safety Net

**Status: DONE.** Committed `1ae8e95`..`4d6553a`, marked complete `cbf870e`. Kept here for reference
(exact rationale/detail) in case later phases need to recall a decision. See [00-STATUS.md](00-STATUS.md)
for repo traps and the validation gate — read that file first, not this one, when starting a session.

### Task 1.1: Commit current working state — DONE
Staged everything except `.env.local`; committed "Fix mid-refactor import debris; app builds and runs again".

### Task 1.2: Dependency modernisation — DONE
One lib per commit, build green after each: React 19, react-router-dom 7 (v7 future flags removed,
now default), Vite 8 + `@vitejs/plugin-react` latest (revised up from the originally-planned Vite 7),
Tailwind 4 (Vite plugin instead of PostCSS, theme moved to CSS `@theme`), TanStack Query 5
(`QueryClientProvider` in `main.jsx`; individual fetch migration happens opportunistically, not mass-refactored).

### Task 1.3: Security fixes — DONE
1. `src/services/tokenGeneration.js`: `VITE_STREAM_API_SECRET` → `STREAM_API_SECRET`,
   `VITE_SUPABASE_SERVICE_ROLE` → `SUPABASE_SERVICE_ROLE_KEY`, read via `process.env` (Express server
   file, not client code — was previously at risk of being inlined into the client bundle).
2. `src/services/database.js` `sendFriendRequest`: UUID-validated both ids before building the
   `.or(...)` PostgREST filter string, closing a filter-bypass risk.

### Task 1.4: Kill duplication & dead code — DONE
1. Deleted `signIn`/`signUp` stubs from `context/AuthContext.jsx` (Login/Signup call `services/auth.js`
   directly — confirmed unused via grep before deleting).
2. Consolidated questionnaires: kept `Interests.jsx` (+ `user_preferences` table), deleted
   `ReaderCategorization.jsx` and its route. `reader_preferences` table left in DB, empty, harmless.
3. Renamed folders (`git mv`, importers updated same commit): `Side-Top bars` → `layout`,
   `Reccomendations` → `recommendations`, `Categorisation` → `onboarding`.
