// src/components/UserCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrCreateDirectConversation } from "../services/chatService";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendshipStatus,
  getFriendCounts,
} from "../services/database";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Unified UserCard component that can function in different modes:
 * - profile: Detailed card with all information and actions
 * - compact: Simple card with basic info for lists
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User data to display
 * @param {string} props.variant - Card style variant: "profile" or "compact" (default: "profile")
 * @param {Function} props.onMessage - Optional callback for message action
 * @param {Function} props.onConnect - Optional callback for connect action
 * @param {boolean} props.loadFriendshipData - Optional flag to load friendship data
 */
const UserCard = ({
  user,
  variant = "profile",
  onMessage,
  onConnect,
  loadFriendshipData = true,
  compact = false,
  showConnect = false,
}) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    id,
    username,
    bio,
    avatar_url,
    reading_type,
    favorite_genres,
    connection_status,
  } = user;

  const [friendStatus, setFriendStatus] = useState(connection_status || null);
  const [counts, setCounts] = useState({ friends: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Load friendship status and counts
  useEffect(() => {
    // Skip loading if not needed or if there's no current user or if it's the current user's card
    if (!loadFriendshipData || !currentUser || !id || currentUser.id === id)
      return;

    const loadData = async () => {
      try {
        // Only fetch if not provided
        if (!connection_status) {
          try {
            const status = await getFriendshipStatus(currentUser.id, id);
            setFriendStatus(status);
          } catch (error) {
            console.error("Error getting friendship status:", error);
            // Don't set overall error - just continue
          }
        }

        try {
          const countsData = await getFriendCounts(id);
          setCounts(countsData);
        } catch (error) {
          console.error("Error getting friend counts:", error);
          // Don't set overall error - just continue
        }
      } catch (error) {
        console.error("Error loading friendship data:", error);
        setLoadError(true);
      }
    };

    loadData();
  }, [currentUser, id, connection_status, loadFriendshipData]);

  const handleFriendAction = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      switch (friendStatus) {
        case "accepted":
          await removeFriend(currentUser.id, id);
          setFriendStatus(null);
          break;
        case "pending":
          // Cancel my outgoing request
          await removeFriend(currentUser.id, id);
          setFriendStatus(null);
          break;
        case "incoming_request":
          await acceptFriendRequest(currentUser.id, id);
          setFriendStatus("accepted");
          break;
        default:
          // Send new friend request
          if (onConnect) {
            onConnect(id);
          } else {
            await sendFriendRequest(currentUser.id, id);
          }
          setFriendStatus("pending");
          break;
      }
    } catch (error) {
      console.error("Failed to update friendship status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      setIsStartingChat(true);

      const conversationId = await getOrCreateDirectConversation(currentUser.id, id);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleConnect = async () => {
    if (!currentUser?.id || !user?.id) return;

    try {
      setIsConnecting(true);
      setError(null);
      await sendFriendRequest(currentUser.id, user.id);
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError("Failed to send friend request");
    } finally {
      setIsConnecting(false);
    }
  };

  // Get button text based on friend status
  const getFriendButtonText = () => {
    if (loading) return "...";

    switch (friendStatus) {
      case "accepted":
        return "Friends";
      case "pending":
        return "Requested";
      case "incoming_request":
        return "Accept";
      default:
        return "Connect";
    }
  };

  // Random gradient backgrounds for cards
  const gradients = [
    "bg-gradient-to-r from-purple-600/10 to-indigo-600/10",
    "bg-gradient-to-r from-blue-600/10 to-cyan-600/10",
    "bg-gradient-to-r from-rose-600/10 to-pink-600/10",
    "bg-gradient-to-r from-amber-600/10 to-orange-600/10",
    "bg-gradient-to-r from-emerald-600/10 to-teal-600/10",
  ];

  // Generate consistent background based on user ID
  const cardGradient = id
    ? gradients[Math.floor(id.charCodeAt(0) % gradients.length)]
    : gradients[0];

  // Render compact variant (for lists)
  if (variant === "compact") {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {avatar_url ? (
                <img
                  src={avatar_url}
                  alt={username || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-white text-lg font-medium">
                  {(username || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {username || "Anonymous Reader"}
            </h3>

            {reading_type && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {reading_type}
              </p>
            )}

            {favorite_genres && favorite_genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {favorite_genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded text-xs"
                  >
                    {genre}
                  </span>
                ))}
                {favorite_genres.length > 2 && (
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded text-xs">
                    +{favorite_genres.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={handleConnect}
            className="px-3 py-1 bg-primary hover:bg-primary-dark text-white text-sm rounded-full transition-colors"
            disabled={loading || isConnecting}
          >
            {isConnecting ? "Connecting..." : getFriendButtonText()}
          </button>
        </div>
      </div>
    );
  }

  // Profile variant (default, full card)
  return (
    <div className="perspective-card h-96 w-full">
      <div
        className={`flip-card-inner w-full h-full transition-transform duration-700 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          className={`flip-card-front ${cardGradient} rounded-lg overflow-hidden border border-gray-200 dark:border-primary/20 shadow-md backdrop-blur-sm p-5 absolute w-full h-full`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center">
            {/* Profile Image */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4 ring-2 ring-primary/20">
              {avatar_url ? (
                <img
                  src={avatar_url}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xl">
                  {(username || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white flex items-center">
                {username || "Anonymous Reader"}
                {reading_type && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                    {reading_type}
                  </span>
                )}
              </h3>
              <div className="flex space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{counts.friends} friends</span>
                {counts.pendingRequests > 0 && (
                  <span>{counts.pendingRequests} pending</span>
                )}
              </div>
            </div>

            {/* Flip button */}
            <button
              className="ml-auto text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              onClick={() => setIsFlipped(true)}
              aria-label="View interests"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </button>
          </div>

          {/* Bio */}
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              About Me
            </h4>
            {bio ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">{bio}</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                No bio available
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-6 absolute bottom-5 left-5 right-5">
            <div className="flex space-x-3">
              {/* Connect/Friend Button */}
              <button
                onClick={handleConnect}
                disabled={loading || isConnecting}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  friendStatus === "accepted"
                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30"
                    : friendStatus === "pending"
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                    : friendStatus === "incoming_request"
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                }`}
              >
                {isConnecting ? "Connecting..." : getFriendButtonText()}
              </button>

              {/* Message Button */}
              {/* Inside the front card's action buttons */}
              <button
                onClick={handleMessage}
                disabled={isStartingChat}
                className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                {isStartingChat ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Starting...
                  </span>
                ) : (
                  "Message"
                )}
              </button>

              {/* View Profile Button */}
              <button
                onClick={() => navigate(`/profile/${id}`)}
                className="flex items-center justify-center w-12 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`flip-card-back rounded-lg overflow-hidden border border-gray-200 dark:border-primary/20 shadow-md p-5 bg-primary/5 dark:bg-gray-800 absolute w-full h-full rotate-y-180`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
              {username}'s Interests
            </h3>
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              onClick={() => setIsFlipped(false)}
              aria-label="Back to profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          </div>

          {/* Favorite Genres */}
          {favorite_genres && favorite_genres.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Favorite Genres
              </h4>
              <div className="flex flex-wrap gap-2">
                {favorite_genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Favorite Genres
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                No favorite genres listed
              </p>
            </div>
          )}

          {/* Action Buttons (Same as front) */}
          <div className="mt-auto pt-6 absolute bottom-5 left-5 right-5">
            <div className="flex space-x-3">
              <button
                onClick={handleConnect}
                disabled={loading || isConnecting}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  friendStatus === "accepted"
                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30"
                    : friendStatus === "pending"
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                    : friendStatus === "incoming_request"
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                }`}
              >
                {isConnecting ? "Connecting..." : getFriendButtonText()}
              </button>

              <button
                onClick={handleMessage}
                className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Message
              </button>

              <button
                onClick={() => navigate(`/profile/${id}`)}
                className="flex items-center justify-center w-12 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
