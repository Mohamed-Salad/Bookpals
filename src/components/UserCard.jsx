// src/components/UserCard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrCreateDirectConversation } from "../services/chatService";
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriendshipStatus,
  getFriendCounts,
} from "../services/database";
import { toast } from "react-toastify";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { cn } from "./ui/cn";

/**
 * Unified UserCard component that can function in different modes:
 * - profile: Detailed flip card with all information and actions
 * - compact: Simple card with basic info for lists
 */
const UserCard = ({
  user,
  variant = "profile",
  onConnect,
  loadFriendshipData = true,
}) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { id, username, bio, avatar_url, reading_type, favorite_genres, connection_status } = user;

  const [friendStatus, setFriendStatus] = useState(connection_status || null);
  const [counts, setCounts] = useState({ friends: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!loadFriendshipData || !currentUser || !id || currentUser.id === id) return;

    const loadData = async () => {
      if (!connection_status) {
        try {
          const status = await getFriendshipStatus(currentUser.id, id);
          setFriendStatus(status);
        } catch (error) {
          console.error("Error getting friendship status:", error);
        }
      }
      try {
        const countsData = await getFriendCounts(id);
        setCounts(countsData);
      } catch (error) {
        console.error("Error getting friend counts:", error);
      }
    };

    loadData();
  }, [currentUser, id, connection_status, loadFriendshipData]);

  const handleConnect = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setIsConnecting(true);
    try {
      switch (friendStatus) {
        case "accepted":
        case "pending":
          await removeFriend(currentUser.id, id);
          setFriendStatus(null);
          break;
        case "incoming_request":
          await acceptFriendRequest(currentUser.id, id);
          setFriendStatus("accepted");
          break;
        default:
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
      toast.error("Couldn't update that. Try again.");
    } finally {
      setLoading(false);
      setIsConnecting(false);
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

  const getFriendButtonText = () => {
    if (loading) return "…";
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

  const connectButtonClass = cn(
    "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border",
    friendStatus === "accepted"
      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
      : friendStatus === "pending"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
      : friendStatus === "incoming_request"
      ? "bg-accent-dark text-white border-accent-dark"
      : "bg-accent/10 text-accent-dark border-accent/30 hover:bg-accent/20"
  );

  // Compact variant (for lists)
  if (variant === "compact") {
    return (
      <div className="bg-surface shadow-sm rounded-lg p-4 border border-ink/10">
        <div className="flex items-start gap-4">
          <Avatar src={avatar_url} name={username} size="lg" />

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-ink truncate">
              {username || "Anonymous Reader"}
            </h3>

            {reading_type && <p className="text-sm text-ink-muted mt-1">{reading_type}</p>}

            {favorite_genres && favorite_genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {favorite_genres.slice(0, 2).map((genre) => (
                  <Badge key={genre}>{genre}</Badge>
                ))}
                {favorite_genres.length > 2 && (
                  <Badge>+{favorite_genres.length - 2}</Badge>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleConnect}
            className="px-3 py-1 bg-accent-dark hover:brightness-110 text-white text-sm rounded-full transition-colors disabled:opacity-50"
            disabled={loading || isConnecting}
          >
            {isConnecting ? "Connecting…" : getFriendButtonText()}
          </button>
        </div>
      </div>
    );
  }

  // Profile variant (default, full flip card)
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
          className="flip-card-front bg-surface rounded-lg overflow-hidden border border-ink/10 shadow-md p-5 absolute w-full h-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center">
            <Avatar src={avatar_url} name={username} size="lg" className="mr-4 ring-2 ring-accent/20" />

            <div>
              <h3 className="font-display font-semibold text-lg text-ink flex items-center">
                {username || "Anonymous Reader"}
                {reading_type && (
                  <Badge variant="accent" className="ml-2">
                    {reading_type}
                  </Badge>
                )}
              </h3>
              <div className="flex gap-3 text-xs text-ink-muted">
                <span>{counts.friends} friends</span>
                {counts.pendingRequests > 0 && <span>{counts.pendingRequests} pending</span>}
              </div>
            </div>

            <button
              className="ml-auto text-ink-muted hover:text-accent-dark transition-colors"
              onClick={() => setIsFlipped(true)}
              aria-label="View interests"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-semibold text-ink-muted mb-2">About Me</h4>
            {bio ? (
              <p className="text-sm text-ink">{bio}</p>
            ) : (
              <p className="text-sm text-ink-muted italic">No bio available</p>
            )}
          </div>

          <div className="mt-auto pt-6 absolute bottom-5 left-5 right-5">
            <div className="flex gap-3">
              <button onClick={handleConnect} disabled={loading || isConnecting} className={connectButtonClass}>
                {isConnecting ? "Connecting…" : getFriendButtonText()}
              </button>

              <button
                onClick={handleMessage}
                disabled={isStartingChat}
                className="flex-1 py-2.5 bg-surface-raised text-ink rounded-lg hover:bg-ink/10 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isStartingChat ? "Starting…" : "Message"}
              </button>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="flip-card-back rounded-lg overflow-hidden border border-ink/10 shadow-md p-5 bg-surface-raised absolute w-full h-full rotate-y-180"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-display font-semibold text-lg text-ink">
              {username}'s Interests
            </h3>
            <button
              className="text-ink-muted hover:text-accent-dark transition-colors"
              onClick={() => setIsFlipped(false)}
              aria-label="Back to profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-ink-muted mb-2">Favorite Genres</h4>
            {favorite_genres && favorite_genres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {favorite_genres.map((genre) => (
                  <Badge key={genre} variant="accent">
                    {genre}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted italic">No favorite genres listed</p>
            )}
          </div>

          <div className="mt-auto pt-6 absolute bottom-5 left-5 right-5">
            <div className="flex gap-3">
              <button onClick={handleConnect} disabled={loading || isConnecting} className={connectButtonClass}>
                {isConnecting ? "Connecting…" : getFriendButtonText()}
              </button>

              <button
                onClick={handleMessage}
                disabled={isStartingChat}
                className="flex-1 py-2.5 bg-surface text-ink rounded-lg hover:bg-ink/10 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isStartingChat ? "Starting…" : "Message"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
