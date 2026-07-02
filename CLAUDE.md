# BookPals

Dissertation project (submitted; now being revived to actually finish/harden). Address the developer as **Mr Salad**.

## What this is

A reading-community platform: users sign up, answer a preference questionnaire, get matched with similar readers, join/create communities, post/comment/react, and chat 1:1 or in groups in real time.

Original goals (recovered from `Reference/`, the salvaged docs from earlier deprecated attempts at this project):
- Secure auth + profile management (Supabase Auth)
- Reader categorization: 5-10 question preference questionnaire feeding a matching/recommendation system
- Public, searchable profiles (search by username/email)
- Communities: create/join, discussion posts, comments, reactions
- Real-time chat: 1:1 and group (Stream/GetStream), separate from communities
- NFRs: 100-1000 concurrent users, GDPR-compliant/encrypted data, <15s response times, intuitive UI

## Stack

- Frontend: React 18 + Vite + TailwindCSS, `react-router-dom` v6
- Backend-as-a-service: Supabase (Postgres, Auth, Realtime)
- Chat: `stream-chat` / `stream-chat-react`, token minted by a small Express server (`src/services/tokenGeneration.js`, run via `npm run token-server`)
- Two processes needed locally: `npm run dev` (Vite) + `npm run token-server` (Express, chat tokens)

## Known issues (as of 2026-07-02, not yet fixed)

- **`src/App.jsx` does not build.** It imports 6 paths that don't exist anywhere in `src/`: `./components/layout/Navbar`, `./components/layout/UnifiedSidebar`, `./pages/community/Communities`, `./pages/community/CommunityView`, `./components/Interests`, `./components/ReaderCategorization`, `./pages/Chat`, `./pages/chat/Conversation`. The real files live at `src/components/Side-Top bars/{Navbar,UnifiedSidebar}.jsx`, `src/components/community/{Communities,CommunityView}.jsx`, `src/components/Categorisation/{Interests,ReaderCategorization}.jsx`, `src/pages/ChatRooms.jsx`, `src/components/chat/Conversation.jsx`. Looks like a mid-refactor left `App.jsx` pointing at a target folder structure (`pages/`, `components/layout/`) that the rest of the tree was never fully moved into.
- **`AuthContext.jsx`'s `signIn`/`signUp` are empty stubs** (`/* ... your signIn logic ... */`). Not a live bug — `Login.jsx`/`Signup.jsx` call `src/services/auth.js` directly, bypassing the context — but the stubs are dead/misleading code.
- **Git working tree is entirely untracked.** The current `src/`, `package.json`, etc. at the project root have zero relationship to git history — `git status` shows them all as `??`. The last real commit (`65ccecd "restarting and completing project"`) tracks an *older* version of the app nested under a `bookpals/` subfolder (different component structure: `Categorisation/`, `Reccomendations/`, `Side-Top bars/` instead of today's `pages/` + `components/`), which git now sees as fully deleted. In short: nothing in the live codebase is committed yet. Confirm with Mr Salad before any git operation that could be read as destructive.

## Reference folder

`Reference/` holds documents salvaged from older, now-deleted local copies of this project (multiple past dissertation iterations). It's historical context only — original requirements, use cases, old architecture docs, coding-rule files from earlier Cursor/Claude sessions — not part of the live app. Don't treat anything in there as current implementation truth; cross-check against actual `src/` code.

## Working conventions (carried over from Mr Salad's earlier project rules)

- Explain implementation choices as you go — Mr Salad is learning the stack (React/Vite/Supabase/Node), treat this as a teaching engagement, not just delivery.
- Prefer Tailwind utility classes over new CSS for styling (matches existing code).
- No TODOs/placeholders left in code; keep diffs beginner-readable.
- If a task is trivial enough that Mr Salad could do it himself meaningfully, say so instead of just doing it.
- Next phase after the app itself is working: containerizing (Docker) and CI/CD (and possibly Kubernetes) — taught hands-on, not just handed over.
