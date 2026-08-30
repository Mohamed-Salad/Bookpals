import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserConversations } from "../services/chatService";
import Conversation from "../components/chat/Conversation";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../components/ui/cn";

function conversationLabel(conversation, currentUserId) {
  if (conversation.is_group) return conversation.name || "Group chat";
  const other = (conversation.conversation_members || [])
    .map((m) => m.profiles)
    .find((p) => p && p.id !== currentUserId);
  return other?.username || "Chat";
}

function conversationAvatar(conversation, currentUserId) {
  if (conversation.is_group) return { name: conversation.name };
  const other = (conversation.conversation_members || [])
    .map((m) => m.profiles)
    .find((p) => p && p.id !== currentUserId);
  return { src: other?.avatar_url, name: other?.username };
}

export default function ChatRooms() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserConversations(user.id)
      .then(setConversations)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const activeConversation = conversations.find((c) => c.id === channelId);

  return (
    <div className="flex h-screen bg-paper">
      <aside className="w-80 shrink-0 border-r border-ink/10 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-ink/10">
          <h1 className="font-display text-xl font-bold text-ink">Chats</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No conversations yet"
                description="Message a reader from their profile to start one."
              />
            </div>
          ) : (
            <ul>
              {conversations.map((c) => {
                const avatar = conversationAvatar(c, user.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/chat/${c.id}`)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-raised transition-colors",
                        channelId === c.id && "bg-surface-raised"
                      )}
                    >
                      <Avatar src={avatar.src} name={avatar.name} size="md" />
                      <span className="font-medium text-ink truncate">
                        {conversationLabel(c, user.id)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <main className="flex-1">
        {!activeConversation ? (
          <div className="flex items-center justify-center h-full text-ink-muted">
            Select a chat to start messaging
          </div>
        ) : (
          <Conversation key={activeConversation.id} conversation={activeConversation} />
        )}
      </main>
    </div>
  );
}
