import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { LoadingIndicator } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import UnifiedSidebar from "../components/Side-Top bars/UnifiedSidebar";
import Conversation from "../components/chat/Conversation";

const ChatPage = () => {
  const { channelId } = useParams();
  const { user } = useAuth();
  const { activeChannel, setActiveChannel, loading, error, streamClient } =
    useChat();

  // Load channel from URL on mount or channel change
  useEffect(() => {
    const loadChannelFromUrl = async () => {
      if (!channelId || !streamClient?.userID) return;

      try {
        // Query for the specific channel
        const channels = await streamClient.queryChannels(
          { id: channelId },
          {},
          { watch: true, state: true }
        );

        if (channels?.[0]) {
          console.log("📥 Loading channel from URL:", channelId);
          setActiveChannel(channels[0]);
        }
      } catch (error) {
        console.error("❌ Error loading channel from URL:", error);
      }
    };

    // Only load if we have a mismatch
    if (channelId && (!activeChannel || activeChannel.id !== channelId)) {
      loadChannelFromUrl();
    }
  }, [channelId, streamClient?.userID]);

  // Debug logs
  console.log("Chat.jsx State:", {
    hasClient: !!streamClient?.userID,
    channelId,
    hasActiveChannel: !!activeChannel,
    activeChannelId: activeChannel?.id,
    loading,
    error,
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedSidebar className="w-80 hidden lg:block" />
        <div className="flex-1 flex items-center justify-center">
          <LoadingIndicator size={40} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedSidebar className="w-80 hidden lg:block" />
        <div className="flex-1 flex items-center justify-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedSidebar className="w-80 hidden lg:block" />
      <div className="flex-1">
        {!activeChannel ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        ) : (
          <Conversation key={activeChannel.id} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
