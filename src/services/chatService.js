import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Finds a direct (non-group) conversation shared by both users, or
// creates one. Must be called as userIdA = the current authenticated
// user - RLS only lets you see conversation_members rows for
// conversations you're already a member of.
export const getOrCreateDirectConversation = async (userIdA, userIdB) => {
  const { data: aRows, error: aError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", userIdA);
  if (aError) throw aError;
  const aIds = (aRows || []).map((r) => r.conversation_id);

  if (aIds.length > 0) {
    const { data: bRows, error: bError } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userIdB)
      .in("conversation_id", aIds);
    if (bError) throw bError;
    const sharedIds = (bRows || []).map((r) => r.conversation_id);

    if (sharedIds.length > 0) {
      const { data: existing, error: existingError } = await supabase
        .from("conversations")
        .select("id")
        .in("id", sharedIds)
        .eq("is_group", false)
        .limit(1)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) return existing.id;
    }
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ is_group: false, created_by: userIdA })
    .select()
    .single();
  if (convError) throw convError;

  const { error: memberError } = await supabase
    .from("conversation_members")
    .insert([
      { conversation_id: conversation.id, user_id: userIdA },
      { conversation_id: conversation.id, user_id: userIdB },
    ]);
  if (memberError) throw memberError;

  return conversation.id;
};

export const createGroupConversation = async (creatorId, name, memberIds) => {
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ is_group: true, name, created_by: creatorId })
    .select()
    .single();
  if (convError) throw convError;

  const rows = [creatorId, ...memberIds].map((userId) => ({
    conversation_id: conversation.id,
    user_id: userId,
  }));
  const { error: memberError } = await supabase
    .from("conversation_members")
    .insert(rows);
  if (memberError) throw memberError;

  return conversation.id;
};

// List conversations for the current user, each with its member profiles
// (for direct chats, used to show "the other person's" name/avatar).
export const getUserConversations = async (userId) => {
  const { data, error } = await supabase
    .from("conversation_members")
    .select(
      "conversation_id, conversations(id, is_group, name, created_at, conversation_members(user_id, profiles:user_id(id, username, avatar_url)))"
    )
    .eq("user_id", userId);
  if (error) throw error;

  return (data || [])
    .map((row) => row.conversations)
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, profiles:sender_id(id, username, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
};

export const sendMessage = async (conversationId, senderId, content) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select("*, profiles:sender_id(id, username, avatar_url)")
    .single();
  if (error) throw error;
  return data;
};

// Initial fetch + live subscription for one conversation's messages.
// Realtime payloads carry only the raw message row (no joined profile),
// so the sender's profile is fetched once per incoming message.
export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getMessages(conversationId).then((data) => {
      if (!cancelled) {
        setMessages(data);
        setLoading(false);
      }
    });

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();
          setMessages((prev) => [...prev, { ...payload.new, profiles: profile }]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, loading };
}
