import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  streamClient,
  connectToChat,
  disconnectFromChat,
} from "../services/streamClient";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cleanup on user change or logout
  useEffect(() => {
    if (!user) {
      setConnected(false);
      setActiveChannel(null);
      setLoading(false);
      // Clear any cached channels
      if (streamClient.userID) {
        console.log("🧹 Cleaning up chat connection");
        disconnectFromChat();
      }
      return;
    }

    // Connect when user exists and not connected
    if (!connected) {
      connectToChat()
        .then(() => {
          console.log("✅ Chat connected in context");
          setConnected(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Chat connection failed:", err);
          setError(err.message);
          setLoading(false);
        });
    }

    // Cleanup on unmount or user change
    return () => {
      if (streamClient.userID) {
        console.log("🧹 Cleaning up chat connection");
        disconnectFromChat();
      }
    };
  }, [user]);

  // Monitor active channel changes
  useEffect(() => {
    if (activeChannel) {
      console.log("🔄 Active channel updated:", {
        id: activeChannel.id,
        type: activeChannel.type,
        members: Object.keys(activeChannel.state.members).length,
      });

      // Watch the channel when it becomes active
      activeChannel.watch().catch((error) => {
        console.error("❌ Error watching channel:", error);
        setError(error.message);
      });

      // Cleanup previous channel subscription
      return () => {
        console.log("👋 Stopping channel watch:", activeChannel.id);
        activeChannel.stopWatching();
      };
    }
  }, [activeChannel]);

  const safeSetActiveChannel = async (channel) => {
    try {
      // If we're clearing the channel
      if (!channel) {
        setActiveChannel(null);
        return;
      }

      // Ensure the channel is watched before setting
      await channel.watch();
      setActiveChannel(channel);
    } catch (error) {
      console.error("❌ Error setting active channel:", error);
      setError(error.message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        connected,
        activeChannel,
        setActiveChannel: safeSetActiveChannel,
        loading,
        error,
        streamClient,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
