import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMessages, sendMessage } from "../../services/chatService";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";

export default function Conversation({ conversation }) {
  const { user } = useAuth();
  const { messages, loading } = useMessages(conversation?.id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const MAX_LENGTH = 4000; // matches messages_content_length in the DB

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const otherMembers = (conversation?.conversation_members || [])
    .map((m) => m.profiles)
    .filter((p) => p && p.id !== user.id);

  const title = conversation?.is_group
    ? conversation.name || "Group chat"
    : otherMembers[0]?.username || "Chat";

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(conversation.id, user.id, trimmed);
      setText("");
    } catch (err) {
      console.error("[Conversation] Failed to send message:", err);
      setError("Couldn't send that message. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-ink/10">
        <h2 className="font-display font-semibold text-ink">{title}</h2>
        {conversation?.is_group && (
          <p className="text-sm text-ink-muted">
            {conversation.conversation_members?.length || 0} members
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-12 w-1/2 ml-auto" />
          </>
        ) : messages.length === 0 ? (
          <p className="text-ink-muted text-sm text-center mt-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}
              >
                {!mine && (
                  <Avatar
                    src={m.profiles?.avatar_url}
                    name={m.profiles?.username}
                    size="sm"
                  />
                )}
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${
                    mine
                      ? "bg-accent-dark text-white rounded-br-sm"
                      : "bg-surface-raised text-ink rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-ink/10">
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={MAX_LENGTH}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !text.trim()}>
            Send
          </Button>
        </div>
        {text.length > MAX_LENGTH * 0.9 && (
          <p className="text-xs text-ink-muted mt-1 text-right">
            {text.length}/{MAX_LENGTH}
          </p>
        )}
      </form>
    </div>
  );
}
