# Phase 6 — Chat: Stream → Supabase Realtime

**Status: DONE.** All three tasks complete 2026-08-30. See [00-STATUS.md](00-STATUS.md) for repo
traps and the validation gate.

### Task 6.1: Schema — DONE, applied via MCP
`supabase/migrations/0008_chat.sql`: `conversations`/`conversation_members`/`messages`, RLS via a
`security definer` `is_conversation_member()` helper — deliberately avoiding the exact RLS
self-recursion pattern found and fixed earlier the same day on `community_members` (a naive
membership-check subquery placed directly on the table it gates recurses). Applied directly to the
live project via Supabase MCP; verified live (`list_tables` — all three tables present, RLS enabled).

### Task 6.2: Client — DONE
`src/services/chatService.js`: `getOrCreateDirectConversation`, `createGroupConversation`,
`getUserConversations`, `sendMessage`, and a `useMessages(conversationId)` hook (initial fetch +
`postgres_changes` INSERT subscription). Rebuilt `pages/ChatRooms.jsx` (two-pane: conversation list +
active thread) and `components/chat/Conversation.jsx` (message list + composer) on Phase 2 primitives.
Simplified `/chat`'s route to a single `path="/chat/:channelId?"` — the old nested-route+`Outlet`
structure in `App.jsx` was never actually wired up (`ChatPage` didn't render `Outlet`), so `ChatRooms`
now just reads the param directly, matching what the code already effectively did. Removed the
`ChatProvider` wrapper entirely — Supabase Realtime doesn't need Stream's persistent global-connection
object; each `useMessages` call owns its own subscription lifecycle.

### Task 6.3: Excise Stream — DONE
`npm rm stream-chat stream-chat-react @stream-io/stream-chat-css express cors dotenv` (the last three
were only used by the now-deleted token server). Deleted `ChatContext.jsx`, `UnifiedSidebar.jsx`
(confirmed only ever rendered by the old chat page), `streamClient.js`, `tokenGeneration.js`,
`stream-chat-custom.css`, and the `token-server` package.json script. Rewired real callers:
`UserCard.jsx`'s "Message" button, `CreateGroupChat.jsx`, and `acceptFriendRequest` in `database.js`
(now starts a direct conversation instead of a Stream channel). Dropped `getUserChatChannels` (dead,
no callers) and `removeFriend`'s Stream cleanup block (no Supabase equivalent added — whether
unfriending should delete conversation history is a separate product decision, not assumed here).
Replaced the `LoadingIndicator` (stream-chat-react) imports in `CommentSection.jsx` and
`RecommendedCommunities.jsx` with `ui/Skeleton` — grepping found no real import in `CommunityView.jsx`
despite the plan's original note; that one was a stale comment, not code.
- **Result**: main bundle chunk 2,149KB → 813KB, 2882 → 1838 modules. Build green; landing page + an
  unauthenticated `/chat` visit (redirects to `/login` correctly) smoke-tested clean via Playwright,
  zero console errors. **Not yet done**: a real logged-in two-account test of live message delivery
  (this session has no Supabase login) — worth doing before calling the feature fully proven.
