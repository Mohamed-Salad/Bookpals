import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useChat } from "../../context/ChatContext";
import {
  streamClient,
  connectToChat,
  disconnectFromChat,
  isValidChannel,
  createGroupChannel,
} from "../../services/streamClient";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  getUserCommunities,
  getFriends,
} from "../../services/database";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, listItem } from "../../utils/animations";
import { supabase } from "../../services/supabaseClient";
import { toast } from "react-toastify";
import CreateGroupChat from "../socials/CreateGroupChat";
import CreateCommunityModal from "../community/CreateCommunityModal";
import {
  HomeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

// Icons for Toggle Button
const CollapseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
    />
  </svg>
);
const ExpandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
    />
  </svg>
);

// Cache to prevent excessive reloading
const CHANNEL_CACHE = {
  data: null,
  timestamp: 0,
};

/**
 * UnifiedSidebar component - combines chat and notification functionality
 *
 * @param {Object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is expanded
 * @param {Function} props.toggleSidebar - Function to toggle the expanded state
 * @param {boolean} props.communityView - Optional flag (keep if still needed)
 */
const UnifiedSidebar = ({ isExpanded, toggleSidebar, communityView }) => {
  const { user } = useAuth();
  const { connected } = useChat();
  const navigate = useNavigate();
  const hasLoadedInitialChannels = useRef(false);

  // Get notification data from context
  const {
    notificationCount,
    friendRequests,
    unreadMessages,
    refreshNotifications,
  } = useNotification();

  // States
  const [activeTab, setActiveTab] = useState("chats");
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [streamError, setStreamError] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] =
    useState(false);

  // Initial load of pre-existing channels - only once
  useEffect(() => {
    if (connected && user?.id && !hasLoadedInitialChannels.current) {
      hasLoadedInitialChannels.current = true;
      loadChannels();
    }
  }, [connected, user?.id]);

  // Event listeners for new channels
  useEffect(() => {
    const handleNewChat = (event) => {
      // Removed detail check - just reload
      loadChannels();
    };

    const handleNewMessage = (event) => {
      // Simplified - reload if message for a channel we don't have
      if (
        event.message &&
        event.channel &&
        !channels.some((c) => c.id === event.channel.id)
      ) {
        loadChannels();
      }
    };

    window.addEventListener("newChatCreated", handleNewChat);

    if (streamClient.userID) {
      streamClient.on("message.new", handleNewMessage);
      streamClient.on("channel.created", handleNewChat);
    }

    return () => {
      window.removeEventListener("newChatCreated", handleNewChat);
      if (streamClient.userID) {
        streamClient.off("message.new", handleNewMessage);
        streamClient.off("channel.created", handleNewChat);
      }
    };
  }, [channels]); // Dependency only on channels

  const loadChannels = async () => {
    console.log("Loading channels with:", {
      connected,
      userID: streamClient.userID,
      loading,
    });

    if (loading || !connected) return;

    try {
      setLoading(true);
      const fetchedChannels = await streamClient.queryChannels(
        {
          type: "messaging",
          members: { $in: [streamClient.userID] },
        },
        { last_message_at: -1 },
        { watch: true, state: true }
      );

      const validChannels = fetchedChannels.filter((channel) => {
        const isValid = isValidChannel(channel);
        if (!isValid) {
          console.log(`🚫 Filtering out legacy channel: ${channel.id}`);
        }
        return isValid;
      });

      console.log(
        `📊 Channels filtered - Total: ${fetchedChannels.length}, Valid: ${validChannels.length}`
      );
      setChannels(validChannels);
      setStreamError(null);
    } catch (error) {
      console.error("Error loading channels:", error);
      setStreamError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load communities when user changes
  useEffect(() => {
    if (!user?.id) return;

    const loadCommunities = async () => {
      try {
        setCommunities([]); // Clear previous data while loading
        const userCommunitiesData = await getUserCommunities(user.id);
        setCommunities(userCommunitiesData || []);
      } catch (error) {
        console.error("Error loading user communities:", error);
      }
    };

    loadCommunities();
  }, [user?.id]);

  const directChats = useMemo(
    () =>
      channels.filter(
        (c) => c.type === "messaging" && c.data.member_count === 2
      ),
    [channels]
  );

  const groupChats = useMemo(
    () => channels.filter((c) => c.data.member_count > 2 || c.type === "team"),
    [channels]
  );

  // Friend request handlers
  const handleAcceptFriend = async (requesterId) => {
    try {
      await acceptFriendRequest(user.id, requesterId);
      refreshNotifications(); // Refresh notifications instead of local state update
      // Update friend count in UserCard
      const updateEvent = new CustomEvent("friendRequestAccepted", {
        detail: { userId: requesterId },
      });
      window.dispatchEvent(updateEvent);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectFriend = async (requestId, userId) => {
    try {
      await rejectFriendRequest(user.id, userId);
      refreshNotifications(); // Refresh the notifications list after rejecting
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  // Message handlers
  const handleOpenChat = async (channelId) => {
    try {
      // Validate channel format first
      if (!channelId.startsWith("msg-")) {
        console.error(`❌ Invalid channel format: ${channelId}`);
        toast.error("This chat is no longer available");
        return;
      }

      // Check if we have a valid connection
      if (!streamClient.userID) {
        console.log("🔌 No Stream connection. Attempting to connect...");
        try {
          await connectToChat();
        } catch (error) {
          console.error("❌ Failed to connect to chat:", error);
          toast.error("Could not connect to chat. Please try again.");
          return;
        }
      }

      // Find the channel
      console.log(`🔍 Finding channel: ${channelId}`);
      const channel = channels.find((c) => c.id === channelId);

      if (!channel) {
        console.error(`❌ Channel not found: ${channelId}`);
        toast.error("Chat not found. Please refresh and try again.");
        return;
      }

      // Let the Chat component handle setting the active channel
      // This prevents race conditions between navigation and channel activation
      console.log(`✅ Channel found: ${channelId}`);
      navigate(`/chat/${channelId}`);
    } catch (error) {
      console.error("❌ Error in handleOpenChat:", error);
      setStreamError(error.message);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleCreateGroupChat = async () => {
    try {
      if (!groupName.trim()) {
        toast.error("Please enter a group name");
        return;
      }
      if (selectedMembers.length === 0) {
        toast.error("Please select at least one member");
        return;
      }

      setIsCreatingGroup(true);
      const channel = await createGroupChannel(groupName, selectedMembers);

      // Set the active channel and navigate
      setActiveChannel(channel);
      navigate(`/chat/${channel.id}`);

      // Reset state
      setGroupName("");
      setSelectedMembers([]);
      setIsCreateGroupModalOpen(false);
      toast.success("Group chat created successfully!");
    } catch (error) {
      console.error("Failed to create group chat:", error);
      toast.error(error.message);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Create Community Modal handler
  const handleCreateCommunitySuccess = (newCommunity) => {
    console.log("[UnifiedSidebar] New community created:", newCommunity);
    setShowCreateCommunityModal(false);
    // Optionally navigate to the new community page or refresh the communities list
    // For now, just close the modal.
  };

  // Render error message if stream API has failed
  const renderErrorState = () => (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 mx-auto mb-3 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="mb-2">Failed to load chat data</p>
      <p className="text-sm text-gray-400 mb-3">{streamError}</p>
      <button
        onClick={() => loadChannels()}
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
      >
        Try Again
      </button>
    </div>
  );

  // Render direct chats list
  const renderDirectChats = () => {
    if (loading) {
      // Simple loading indicator
      return (
        <div
          className={`flex justify-center py-4 ${
            !isExpanded && "h-32 items-center"
          }`}
        >
          <div className="loading-spinner"></div>
        </div>
      );
    }
    if (streamError) return renderErrorState();

    return (
      <div className="space-y-1">
        {channels.map((channel) => {
          const otherMember = Object.values(channel.state.members || {}).find(
            (member) => member.user_id !== user?.id
          )?.user;
          const lastMessage =
            channel.state.messages[channel.state.messages.length - 1];
          const unreadCount = channel.countUnread();
          const isActive = window.location.pathname.includes(channel.id);

          return (
            <div
              key={channel.id}
              onClick={() => handleOpenChat(channel.id)}
              title={isExpanded ? "" : otherMember?.name || "Unknown User"} // Tooltip when collapsed
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                isExpanded ? "justify-start" : "justify-center"
              } ${
                isActive
                  ? "bg-primary/20"
                  : unreadCount > 0
                  ? "bg-primary/10 hover:bg-primary/20"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700/30"
              }`}
            >
              {/* Avatar/Initial */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                {otherMember?.image ? (
                  <img
                    src={otherMember.image}
                    alt={otherMember.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white text-sm font-medium">
                    {(otherMember?.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Text content - only if expanded */}
              {isExpanded && (
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {otherMember?.name || "Unknown User"}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded-full font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {lastMessage.text || "Attachment"}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {channels.length === 0 && !loading && (
          <div
            className={`text-center py-4 text-gray-500 text-xs ${
              !isExpanded && "hidden"
            }`}
          >
            No conversations
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const loadFriends = async () => {
      if (!user?.id || activeTab !== "friends") return;
      setFriendsLoading(true);
      try {
        const friendsList = await getFriends(user.id);
        setFriends(friendsList);
      } catch (error) {
        console.error("Error loading friends:", error);
        toast.error("Failed to load friends");
      } finally {
        setFriendsLoading(false);
      }
    };
    loadFriends();
  }, [user?.id, activeTab]);

  const renderFriends = () => (
    <div className={`space-y-4 ${isExpanded ? "p-4" : "p-2"}`}>
      {/* Friend Requests Section - only if expanded */}
      {isExpanded && friendRequests.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Requests ({friendRequests.length})
          </h3>
          <div className="space-y-2">
            {friendRequests.map((request) => (
              <div
                key={request.user_id}
                className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
                      {request.profiles.avatar_url ? (
                        <img
                          src={request.profiles.avatar_url}
                          alt={request.profiles.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                          {request.profiles.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {request.profiles.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Wants to connect
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptFriend(request.user_id)}
                      className="flex-1 py-1.5 px-3 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleRejectFriend(request.id, request.user_id)
                      }
                      className="flex-1 py-1.5 px-3 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List Section */}
      <div>
        <div
          className={`flex justify-between items-center mb-2 ${
            !isExpanded && "flex-col items-center"
          }`}
        >
          <h3
            className={`text-xs font-medium text-gray-500 dark:text-gray-400 ${
              !isExpanded && "hidden"
            }`}
          >
            Friends ({friends.length})
          </h3>
          {isExpanded && (
            <button
              onClick={() => navigate("/discover")}
              className="text-xs text-primary hover:text-primary-dark"
            >
              Find Friends
            </button>
          )}
        </div>
        {friendsLoading ? (
          <div
            className={`flex justify-center py-4 ${
              !isExpanded && "h-32 items-center"
            }`}
          >
            <div className="loading-spinner"></div>
          </div>
        ) : friends.length === 0 ? (
          <div
            className={`text-center py-4 text-gray-500 text-xs ${
              !isExpanded && "hidden"
            }`}
          >
            No friends yet.
          </div>
        ) : (
          <div className="space-y-1">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                  isExpanded ? "justify-between" : "justify-center"
                }`}
                title={isExpanded ? "" : friend.username}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {/* Avatar/Initial */}
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        alt={friend.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white text-sm font-medium">
                        {friend.username?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  {isExpanded && (
                    <span className="ml-3 text-sm text-gray-800 dark:text-white font-medium truncate">
                      {friend.username}
                    </span>
                  )}
                </div>
                {/* Action buttons - maybe hide on collapse or show differently? Hiding for now */}
                {isExpanded && (
                  <div className="flex gap-2">
                    {/* Message / Add to Group Buttons */}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGroupChats = () => (
    <motion.div
      key="groups"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-1"
    >
      {groupChats.length > 0 ? (
        groupChats.map((channel) => (
          <motion.div
            key={channel.id}
            variants={listItem}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={isExpanded ? "" : channel.data.name || "Group Chat"}
          >
            <button
              onClick={() => handleOpenChat(channel.id)}
              className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors ${
                !isExpanded && "justify-center"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                {channel.data.name?.[0]?.toUpperCase() || "G"}
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-gray-800 dark:text-white font-medium truncate">
                    {channel.data.name || "Group Chat"}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {channel.data.member_count || 0} members
                  </p>
                </div>
              )}
            </button>
          </motion.div>
        ))
      ) : (
        <div
          className={`text-center py-8 text-gray-500 dark:text-gray-400 ${
            !isExpanded && "hidden"
          }`}
        >
          {/* Collapsed state for no groups can be just empty or a small icon */}
          {isExpanded && (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />{" "}
              </svg>
              <p className="text-xs">No group chats</p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderCommunities = () => (
    <div className="space-y-1">
      {/* Button to Create Community - only if expanded */}
      {isExpanded && (
        <button
          onClick={() => setShowCreateCommunityModal(true)}
          className="w-full flex items-center justify-center space-x-2 p-2 mb-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          <span>Create Community</span>
        </button>
      )}

      {communities.map((community) => (
        <motion.div
          key={community.id}
          variants={listItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/community/${community.id}`)}
          title={isExpanded ? "" : community.name}
          className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center space-x-3 ${
            !isExpanded && "justify-center"
          }`}
        >
          {/* Community Icon/Image Placeholder */}
          <div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
            {community.image_url ? (
              <img
                src={community.image_url}
                alt={community.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <span className="text-primary dark:text-primary-light font-semibold text-sm">
                {community.name?.charAt(0).toUpperCase() || "C"}
              </span>
            )}
          </div>
          {/* Community Info - only if expanded */}
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white truncate">
                {community.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {community.member_count || 0} members
              </p>
            </div>
          )}
        </motion.div>
      ))}
      {communities.length === 0 && (
        <p
          className={`text-gray-500 dark:text-gray-400 text-center text-xs py-4 ${
            !isExpanded && "hidden"
          }`}
        >
          No communities yet.
        </p>
      )}
    </div>
  );

  const renderNotifications = () => (
    <motion.div
      key="notifications"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-2"
    >
      {friendRequests.length === 0 && unreadMessages.length === 0 ? (
        <div
          className={`text-center py-8 text-gray-500 dark:text-gray-400 ${
            !isExpanded && "hidden"
          }`}
        >
          {/* Collapsed state can just be empty or a small icon */}
          {isExpanded && (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-xs">No notifications</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Friend Requests - Render conditionally based on isExpanded */}
          {isExpanded &&
            friendRequests.map((request) => {
              const requester = request.profiles;
              return (
                <div
                  key={`fr-${request.user_id}`}
                  className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
                      {requester.avatar_url ? (
                        <img
                          src={requester.avatar_url}
                          alt={requester.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                          {requester.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {requester.username || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Friend request
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptFriend(request.user_id)}
                      className="flex-1 py-1.5 px-3 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleRejectFriend(request.id, request.user_id)
                      }
                      className="flex-1 py-1.5 px-3 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Unread Messages - Render conditionally based on isExpanded */}
          {isExpanded &&
            unreadMessages.map((message) => (
              <div
                key={`msg-${message.id}`}
                onClick={() => handleOpenChat(message.id)}
                className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {message.image ? (
                      <img
                        src={message.image}
                        alt={message.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-white ${
                          message.type === "group"
                            ? "bg-secondary"
                            : "bg-primary"
                        }`}
                      >
                        {message.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {message.name}
                      </p>
                      <span className="ml-2 bg-primary text-white text-xs px-1.5 rounded-full">
                        {message.unreadCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {message.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          {/* Consider showing only counts or icons when collapsed if needed */}
        </>
      )}
    </motion.div>
  );

  return (
    // Use flex-col and h-full to allow toggle button at bottom
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isExpanded ? "w-72" : "w-20"
      }`}
    >
      {/* Header Section */}
      <div
        className={`p-4 border-b border-gray-200 dark:border-gray-700/30 ${
          !isExpanded && "px-2"
        }`}
      >
        <Link
          to={user ? "/home" : "/"}
          className={`font-bold text-primary flex items-center ${
            isExpanded ? "text-xl justify-start" : "text-lg justify-center"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-6 h-6 ${isExpanded && "mr-2"}`}
          >
            {" "}
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 01-1.06-1.06l8.69-8.69z" />{" "}
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />{" "}
          </svg>
          {isExpanded && <span>BookPals</span>}
        </Link>
        {isExpanded && (
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 truncate">
            Welcome back,{" "}
            {user?.user_metadata?.username ||
              user?.email?.split("@")[0] ||
              "User"}
          </p>
        )}
      </div>

      {/* Navigation Links (Profile/Discover) */}
      <div
        className={`flex p-2 border-b border-gray-200 dark:border-gray-700/30 ${
          isExpanded ? "justify-start" : "flex-col items-center space-y-1"
        }`}
      >
        <button
          onClick={() => navigate("/profile")}
          title={!isExpanded ? "Profile" : ""}
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors w-full ${
            !isExpanded && "justify-center"
          }`}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {isExpanded && (
            <span className="text-sm text-gray-800 dark:text-white">
              Profile
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("/discover")}
          title={!isExpanded ? "Discover" : ""}
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors w-full ${
            !isExpanded && "justify-center"
          }`}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isExpanded && (
            <span className="text-sm text-gray-800 dark:text-white">
              Discover
            </span>
          )}
        </button>
      </div>

      {/* Tabs - Adapt for collapsed state */}
      <div
        className={`flex border-b border-gray-200 dark:border-gray-700/30 overflow-x-auto ${
          isExpanded ? "px-2 py-2 space-x-1" : "flex-col space-y-1 p-1"
        }`}
      >
        {/* Define tabs array */}
        {[
          { key: "chats", label: "Chats", icon: <ChatIcon /> },
          { key: "groups", label: "Groups", icon: <GroupsIcon /> },
          { key: "communities", label: "Communities", icon: <CommunityIcon /> },
          {
            key: "friends",
            label: "Friends",
            icon: <FriendsIcon />,
            count: friendRequests.length,
          },
          {
            key: "notifications",
            label: "Notifications",
            icon: <NotificationIcon />,
            count: notificationCount,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            title={!isExpanded ? tab.label : ""}
            className={`flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30"
            } ${!isExpanded && "justify-center w-full"}`}
          >
            <span className={`w-5 h-5 ${isExpanded && "mr-2"}`}>
              {tab.icon}
            </span>
            {isExpanded && <span>{tab.label}</span>}
            {tab.count > 0 && (
              <span
                className={`ml-auto bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ${
                  !isExpanded && "absolute top-1 right-1"
                }`}
              >
                {tab.count > 9 ? "9+" : tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons - Render conditionally based on tab and isExpanded */}
      {isExpanded &&
        (activeTab === "chats" ||
          activeTab === "groups" ||
          activeTab === "communities") && (
          <div className="px-4 py-2">
            {/* Render specific action button based on activeTab */}
            {activeTab === "chats" && (
              <button
                onClick={() => navigate("/discover")}
                className="w-full flex items-center justify-center space-x-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span>Find Users</span>
              </button>
            )}
            {activeTab === "groups" && (
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span>Create Group</span>
              </button>
            )}
            {activeTab === "communities" && (
              <button
                onClick={() => setShowCreateCommunityModal(true)}
                className="w-full flex items-center justify-center space-x-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span>Create Community</span>
              </button>
            )}
          </div>
        )}

      {/* Main Content Area - Use flex-grow and overflow-y-auto */}
      <div
        className={`flex-grow overflow-y-auto overflow-x-hidden py-2 ${
          isExpanded ? "px-2" : "px-0"
        }`}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : streamError ? (
            <motion.div
              key="error"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderErrorState()}
            </motion.div>
          ) : activeTab === "chats" ? (
            <motion.div
              key="direct-chats"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderDirectChats()}
            </motion.div>
          ) : activeTab === "groups" ? (
            renderGroupChats()
          ) : activeTab === "communities" ? (
            renderCommunities()
          ) : activeTab === "friends" ? (
            renderFriends()
          ) : (
            renderNotifications()
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Toggle Button - Replaces Home Button */}
      <div
        className={`p-2 border-t border-gray-200 dark:border-gray-700/30 mt-auto ${
          !isExpanded && "py-3"
        }`}
      >
        <button
          onClick={toggleSidebar}
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          className={`w-full flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          {isExpanded && (
            <span className="ml-2 text-sm text-gray-800 dark:text-white">
              Collapse
            </span>
          )}
        </button>
      </div>

      {/* Modals */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[600px] max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Create Group Chat
              </h3>
              <button
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <CreateGroupChat onClose={() => setIsCreateGroupModalOpen(false)} />
          </div>
        </div>
      )}
      <CreateCommunityModal
        isOpen={showCreateCommunityModal}
        onClose={() => setShowCreateCommunityModal(false)}
        onSuccess={handleCreateCommunitySuccess}
      />
    </div>
  );
};

// Placeholder Icons (replace with actual SVGs or library icons)
const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm5.5-1.5a.5.5 0 000 1h3a.5.5 0 000-1h-3zM6 11.5a.5.5 0 000 1h8a.5.5 0 000-1H6z"
      clipRule="evenodd"
    />
  </svg>
);
const GroupsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
  </svg>
);
const CommunityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10.483 2.164a.75.75 0 01.034 1.06l-1.75 2.004a.75.75 0 01-1.098-.034L6.013 3.224a.75.75 0 011.06-1.06l1.656 1.658 1.656-1.658a.75.75 0 011.098.034zM16.75 7.75A.75.75 0 0016 7H4a.75.75 0 000 1.5h12a.75.75 0 00.75-.75zM18 12a.75.75 0 01-.75.75H9.75a.75.75 0 010-1.5h7.5A.75.75 0 0118 12zM9.75 17.25a.75.75 0 000-1.5h-6a.75.75 0 000 1.5h6z"
      clipRule="evenodd"
    />
  </svg>
);
const FriendsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM1.093 16.012a7 7 0 0111.814 0 1.06 1.06 0 01.024 1.035 1.06 1.06 0 01-1.57.652 4.978 4.978 0 00-8.74 0 1.06 1.06 0 01-1.57-.652 1.06 1.06 0 01.024-1.035zM12.943 17.7c.354-.33.803-.523 1.28-.523a2.47 2.47 0 011.533.56h.002a1.876 1.876 0 011.743 2.267 1.876 1.876 0 01-1.743 1.453H14.5a2.5 2.5 0 010-5 .48.48 0 00-.057 0z" />
  </svg>
);
const NotificationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.006h13.484a.75.75 0 00.515-1.006C16.454 11.665 16 9.887 16 8a6 6 0 00-6-6zM8.5 16a1.5 1.5 0 103 0h-3z"
      clipRule="evenodd"
    />
  </svg>
);

export default React.memo(UnifiedSidebar);
