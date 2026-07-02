import React from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const ChatHeader = ({ channel }) => {
  const memberCount = Object.keys(channel.state.members).length;
  const isGroup = channel.data?.type === "group";

  return (
    <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold dark:text-white">
            {channel.data?.name || "Chat"}
          </h2>
          {isGroup && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {memberCount} members
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Conversation = () => {
  const { activeChannel, streamClient } = useChat();

  if (!activeChannel || !streamClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <Chat client={streamClient}>
        <Channel channel={activeChannel}>
          <Window>
            <ChatHeader channel={activeChannel} />
            <MessageList />
            <MessageInput focus />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default Conversation;
