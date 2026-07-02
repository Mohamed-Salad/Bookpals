import { StreamChat } from "stream-chat";
import { supabase } from "./supabaseClient";

// 1. Initialize client
export const streamClient = StreamChat.getInstance(
  import.meta.env.VITE_STREAM_API_KEY
);

// Utility function to validate channel IDs
export function isValidChannel(channel) {
  if (!channel?.id) return false;
  // Valid channels must start with 'msg-' (our new format)
  return channel.id.startsWith("msg-");
}

// 2. Main connection function
export async function connectToChat() {
  try {
    // Check if already connected
    if (streamClient.userID) {
      console.log(
        "✅ Already connected to Stream Chat as:",
        streamClient.userID
      );
      return streamClient;
    }

    // Get current Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("❌ No active Supabase session found");
      throw new Error("No active login session");
    }

    console.log("📡 Fetching Stream token...");
    // Get Stream token from our server
    const response = await fetch("http://localhost:3001/get-stream-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supabaseToken: session.access_token,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Token server error:", errorText);
      throw new Error(`Failed to get chat token: ${errorText}`);
    }

    const { token, user_id } = await response.json();
    console.log("🔑 Stream token received for user:", user_id);

    // Connect to Stream
    await streamClient.connectUser(
      {
        id: user_id,
        name: session.user.email,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          session.user.email.charAt(0)
        )}`,
      },
      token
    );

    console.log("✅ Successfully connected to Stream Chat as:", user_id);

    // Sync friendship status after successful connection
    try {
      await syncFriendshipStatus(user_id);
    } catch (syncError) {
      console.error("⚠️ Failed to sync friendship status:", syncError);
      // Don't throw - connection was successful
    }

    return streamClient;
  } catch (error) {
    console.error("❌ Chat connection failed:", error.message);
    // Clean up any partial connection state
    if (streamClient.userID) {
      await streamClient.disconnectUser();
    }
    throw error;
  }
}

// 3. Simple disconnect function
export async function disconnectFromChat() {
  try {
    if (!streamClient.userID) {
      console.log("No active chat connection to disconnect");
      return;
    }

    await streamClient.disconnectUser();
    console.log(
      `✅ Successfully disconnected user ${streamClient.userID} from Stream Chat`
    );
  } catch (error) {
    console.error("❌ Error disconnecting from Stream Chat:", error.message);
    throw error;
  }
}

// 4. Create a direct messaging channel between two users
export async function createDirectChannel(userId1, userId2) {
  try {
    // Take first 12 chars of each ID to stay well under 64 char limit
    const channelId = `msg-${userId1.slice(0, 12)}-${userId2.slice(0, 12)}`;

    // Create a new direct channel with the user
    const channel = streamClient.channel("messaging", channelId, {
      members: [userId1, userId2],
      created_by_id: userId1,
    });

    // Initialize the channel
    await channel.create();
    await channel.watch();

    console.log(`✅ Created/retrieved DM channel: ${channelId}`);
    return channel;
  } catch (error) {
    console.error("❌ Failed to create direct channel:", error.message);
    throw error;
  }
}

export async function createGroupChannel(groupName, memberIds) {
  try {
    if (!streamClient?.userID) {
      console.error("❌ No Stream connection available");
      throw new Error("No Stream connection available");
    }

    // Generate a unique channel ID with correct prefix
    const channelId = `msg-group-${Date.now()}`;

    // Create the channel with required properties only
    const channel = streamClient.channel("messaging", channelId, {
      name: groupName,
      members: [streamClient.userID, ...memberIds],
      created_by_id: streamClient.userID,
    });

    // Initialize the channel
    await channel.create();
    await channel.watch();

    console.log("✅ Group channel created successfully:", {
      channelId,
      name: groupName,
      members: [streamClient.userID, ...memberIds],
    });

    return channel;
  } catch (error) {
    console.error("❌ Failed to create group channel:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create group channel";
    throw new Error(errorMessage);
  }
}

// Sync friendship status with Stream
export async function syncFriendshipStatus(userId) {
  try {
    if (!streamClient?.userID) {
      console.error("❌ No Stream connection available");
      throw new Error("No Stream connection available");
    }

    // Get user's friends from Supabase
    const { data: friends, error } = await supabase
      .from("user_connections")
      .select("connected_user_id")
      .eq("user_id", userId)
      .eq("status", "accepted");

    if (error) throw error;

    // Update Stream user data with friend list
    await streamClient.upsertUser({
      id: userId,
      friends: friends.map((f) => f.connected_user_id),
      // Preserve existing user data
      ...streamClient.user,
    });

    console.log(
      "✅ Friendship status synced with Stream:",
      friends.length,
      "friends"
    );
    return friends;
  } catch (error) {
    console.error("❌ Failed to sync friendship status:", error);
    throw error;
  }
}

// Optimize channel creation by checking friendship first
export async function getOrCreateDirectChannel(targetUserId) {
  try {
    if (!streamClient?.userID) {
      throw new Error("No Stream connection available");
    }

    // Check if users are friends
    const { data: connection } = await supabase
      .from("user_connections")
      .select("status")
      .eq("user_id", streamClient.userID)
      .eq("connected_user_id", targetUserId)
      .single();

    if (!connection || connection.status !== "accepted") {
      throw new Error("Users must be friends to create a chat");
    }

    // Generate consistent channel ID
    const channelId = `msg-${[streamClient.userID, targetUserId]
      .sort()
      .map((id) => id.slice(0, 12))
      .join("-")}`;

    // Try to get existing channel first
    let channel = streamClient.channel("messaging", channelId);
    try {
      const exists = await channel.query();
      if (exists.channel) {
        console.log("✅ Found existing channel:", channelId);
        return channel;
      }
    } catch (error) {
      // Channel doesn't exist, continue to creation
    }

    // Create new channel
    channel = await createDirectChannel(streamClient.userID, targetUserId);
    console.log("✅ Created new channel:", channelId);
    return channel;
  } catch (error) {
    console.error("❌ Failed to get/create channel:", error);
    throw error;
  }
}
