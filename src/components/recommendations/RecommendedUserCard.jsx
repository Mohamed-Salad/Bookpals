import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { connectToChat, createDirectChannel } from "../../services/streamClient";
import { sendFriendRequest, getFriendshipStatus } from "../../services/database";
import { toast } from "react-toastify";

export default function RecommendedUserCard({
  user,
  matchScore,
  matchingPreferences,
  currentUserPreferences,
  matchingGenres,
  matchDetails,
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null);
  const { user: currentUser } = useAuth();
  const { setActiveChannel } = useChat();
  const navigate = useNavigate();

  // Check friendship status on mount
  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!currentUser?.id || !user?.id) return;
      try {
        const status = await getFriendshipStatus(currentUser.id, user.id);
        setFriendStatus(status);
      } catch (err) {
        console.error("Error checking friendship status:", err);
      }
    };
    checkFriendStatus();
  }, [currentUser?.id, user?.id]);

  const handleConnect = async () => {
    if (!currentUser?.id || !user?.id) return;

    try {
      setIsConnecting(true);
      setError(null);

      if (friendStatus === "accepted") {
        toast.info("You are already friends with this user!");
        return;
      }

      await sendFriendRequest(currentUser.id, user.id);
      toast.success(
        <div>
          <p>Friend request sent to {user.username}!</p>
          <p className="text-sm mt-1">
            You are {matchScore}% similar based on reading preferences
          </p>
        </div>,
        { autoClose: 5000 }
      );
      setFriendStatus("pending");
    } catch (err) {
      console.error("Error sending friend request:", err);
      if (err.message.includes("Connection already exists")) {
        toast.info("You already have a pending request with this user.");
      } else {
        toast.error("Failed to send friend request. Please try again.");
      }
      setError("Failed to send friend request");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUser?.id || !user?.id) {
      navigate("/login");
      return;
    }

    try {
      setIsStartingChat(true);
      await connectToChat(); // Ensure Stream client is connected
      const channel = await createDirectChannel(currentUser.id, user.id);
      await setActiveChannel(channel);

      window.dispatchEvent(
        new CustomEvent("newChatCreated", {
          detail: { channelId: channel.cid, userId: user.id },
        })
      );

      navigate(`/chat/${channel.cid}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  // Get button text based on friend status
  const getFriendButtonText = () => {
    if (isConnecting) return "Connecting...";
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

  const formatPreferenceName = (name) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getMatchBadges = () => {
    const badges = [];

    // Add genre badge if there are matching genres
    if (matchingGenres?.length > 0) {
      badges.push({
        label: `${matchingGenres.length} Shared Genre${
          matchingGenres.length > 1 ? "s" : ""
        }`,
        color: "bg-purple-100 text-purple-800",
      });
    }

    // Add badges for other matching preferences
    matchDetails?.forEach((match) => {
      if (match.type === "reading_type") {
        badges.push({
          label: `Same Reading Style: ${match.value}`,
          color: "bg-blue-100 text-blue-800",
        });
      } else if (match.type === "reading_frequency") {
        badges.push({
          label: `Both Read ${match.value}`,
          color: "bg-green-100 text-green-800",
        });
      }
    });

    return badges;
  };

  const getMatchingDetails = () => {
    const details = [];

    // Show matching genres first with count
    if (matchingGenres?.length > 0) {
      details.push({
        label: "Shared Genres",
        value: matchingGenres.join(", "),
        priority: 1,
        color: "text-purple-800",
      });
    }

    // Add other matching preferences with their values
    matchDetails?.forEach((match) => {
      if (match.type !== "genres") {
        details.push({
          label: formatPreferenceName(match.type),
          value: match.value,
          priority: 2,
          color: "text-blue-800",
        });
      }
    });

    return details.sort((a, b) => a.priority - b.priority);
  };

  // Get a consistent color based on username
  const getAvatarColor = (username) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="perspective-card w-full h-64">
      <div
        className={`flip-card-inner w-full h-full ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="flip-card-front absolute w-full h-full bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${getAvatarColor(
                    user.username
                  )} text-white text-lg font-medium`}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.username}</h3>
              <p className="text-sm text-gray-600">{user.reading_type}</p>
            </div>
          </div>

          <div className="mt-4 flex-1">
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Match Score
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {matchScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {matchingGenres?.length || 0} shared genres and{" "}
                {matchDetails?.length || 0} matching preferences
              </p>
            </div>

            {/* Match badges */}
            <div className="flex flex-wrap gap-2">
              {getMatchBadges().map((badge, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleConnect();
              }}
              disabled={isConnecting}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                friendStatus === "accepted"
                  ? "bg-green-500/20 text-green-700 border border-green-500/30"
                  : friendStatus === "pending"
                  ? "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } disabled:opacity-50`}
            >
              {getFriendButtonText()}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMessage();
              }}
              disabled={isStartingChat}
              className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Starting...
                </span>
              ) : (
                "Message"
              )}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Back of card */}
        <div className="flip-card-back absolute w-full h-full bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-3">Why You Match</h3>
          <div className="space-y-3 max-h-[calc(100%-4rem)] overflow-y-auto">
            {getMatchingDetails().map((detail, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{detail.label}</span>
                <p className={`${detail.color} mt-1`}>{detail.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Click to flip back
          </p>
        </div>
      </div>
    </div>
  );
}
