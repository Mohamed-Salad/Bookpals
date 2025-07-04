import { useState } from "react";
import { sendFriendRequest } from "../../services/database";
import { useAuth } from "../../context/AuthContext";

export default function UserCard({
  user,
  compact = false,
  showConnect = false,
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

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

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={`${user.username}'s avatar`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl text-gray-500">
              {user.username?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {user.username || "Anonymous User"}
          </h3>
          {!compact && user.bio && (
            <p className="text-sm text-gray-600 truncate">{user.bio}</p>
          )}
        </div>

        {showConnect && currentUser?.id !== user.id && (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
