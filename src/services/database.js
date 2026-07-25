import { supabase } from "./supabaseClient";
import {
  createDirectChannel,
  streamClient,
  connectToChat,
} from "./streamClient";

console.log(
  "[Database Module] Imported supabase type:",
  typeof supabase,
  "Keys:",
  supabase ? Object.keys(supabase).join(", ") : "null"
);

// User-supplied ids get interpolated straight into PostgREST .or() filter
// strings below. An id that isn't a UUID could break out of the intended
// filter clause, so every id reaching a raw .or() template is validated here
// first - one guard shared by every caller rather than one per call site.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const assertUuid = (id, label) => {
  if (!UUID_RE.test(id)) {
    throw new Error(`Invalid ${label}: expected a UUID`);
  }
};

// Re-export createDirectChannel from streamClient

// ==========================
// Profile Methods
// ==========================
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] getProfile error:", error);
    throw error;
  }
};

export const createProfile = async (userId, username) => {
  try {
    console.log(
      `[Database] Creating profile for user ID: ${userId}, username: ${username}`
    );

    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "row not found" which is expected if profile doesn't exist
      console.error("[Database] Error checking existing profile:", checkError);
    }

    if (existingProfile) {
      console.log(
        `[Database] Profile already exists for user ${userId}, returning existing profile`
      );
      return existingProfile;
    }

    // Create new profile
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Database] Error creating profile:", error);
      throw error;
    }

    console.log(`[Database] Successfully created profile for user ${userId}`);
    return data;
  } catch (error) {
    console.error("[Database] createProfile error:", error);
    throw error;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] updateProfile error:", error);
    throw error;
  }
};

export const updateProfilePicture = async (userId, file) => {
  try {
    // Validate file type (optional)
    const validFileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validFileTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and GIF are allowed."
      );
    }

    // Generate a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const filePath = fileName;

    // Upload the file to the storage bucket
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update the user's profile with the new avatar URL
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return data; // Return the updated profile data
  } catch (error) {
    console.error("[updateProfilePicture] error:", error);
    throw error; // Rethrow the error for further handling
  }
};
// ==========================
// Preferences Methods
// ==========================
export const createPreferences = async (userId, preferences) => {
  try {
    console.log("[Database] Creating preferences for user:", userId);
    console.log("[Database] Received preferences data:", preferences);

    // Validate input data
    if (!preferences.reading_type || !preferences.reading_frequency) {
      console.warn("[Database] Missing required preferences:", {
        hasReadingType: !!preferences.reading_type,
        hasReadingFreq: !!preferences.reading_frequency,
      });
    }

    // Check if user already has preferences
    const { data: existingPrefs } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    console.log("[Database] Existing preferences:", existingPrefs);

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        reading_type: preferences.reading_type,
        reading_frequency: preferences.reading_frequency,
        preferred_reading_time: preferences.reading_time || null,
        preferred_reading_format: preferences.reading_format || null,
        favorite_genres: preferences.genres || [],
        favorite_authors: preferences.favorite_authors
          ? preferences.favorite_authors.split(",").map((a) => a.trim())
          : [],
        reading_goals: preferences.reading_goals || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Database] Error creating preferences:", error);
      throw error;
    }

    console.log("[Database] Successfully created/updated preferences:", data);
    return data;
  } catch (error) {
    console.error("[Database] createPreferences error:", error);
    throw error;
  }
};

export const getPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] getPreferences error:", error);
    throw error;
  }
};

export const updatePreferences = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] updatePreferences error:", error);
    throw error;
  }
};

// Send a friend request
export const sendFriendRequest = async (senderId, receiverId) => {
  try {
    assertUuid(senderId, "senderId");
    assertUuid(receiverId, "receiverId");

    // Check if connection already exists in either direction
    const { data: existingConnection } = await supabase
      .from("user_connections")
      .select("*")
      .or(
        `and(user_id.eq.${senderId},connected_user_id.eq.${receiverId}),and(user_id.eq.${receiverId},connected_user_id.eq.${senderId})`
      );

    if (existingConnection?.length > 0) {
      console.log("[Database] Connection already exists:", existingConnection);
      throw new Error("Connection already exists");
    }

    const { error } = await supabase.from("user_connections").insert({
      user_id: senderId,
      connected_user_id: receiverId,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[Database] sendFriendRequest error:", error);
    throw error;
  }
};

// Accept a friend request
export const acceptFriendRequest = async (userId, requesterId) => {
  try {
    // Update the connection status
    const { error: updateError } = await supabase
      .from("user_connections")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", requesterId)
      .eq("connected_user_id", userId);

    if (updateError) throw updateError;

    // Create reciprocal connection
    const { error } = await supabase.from("user_connections").insert({
      user_id: userId,
      connected_user_id: requesterId,
      status: "accepted",
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Connect to Stream Chat if not already connected
    if (!streamClient.userID) {
      await connectToChat();
    }

    // Create a direct chat channel
    const channel = streamClient.channel("messaging", {
      members: [userId, requesterId],
    });

    await channel.create();
    await channel.watch();

    return true;
  } catch (error) {
    console.error("[Database] acceptFriendRequest error:", error);
    throw error;
  }
};

// Reject a friend request
export const rejectFriendRequest = async (userId, requesterId) => {
  try {
    const { error } = await supabase
      .from("user_connections")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", requesterId)
      .eq("connected_user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[Database] rejectFriendRequest error:", error);
    throw error;
  }
};

// Remove a friend
export const removeFriend = async (userId, friendId) => {
  try {
    assertUuid(userId, "userId");
    assertUuid(friendId, "friendId");

    // Delete both connections
    const { error: error1 } = await supabase
      .from("user_connections")
      .delete()
      .or(
        `and(user_id.eq.${userId},connected_user_id.eq.${friendId}),and(user_id.eq.${friendId},connected_user_id.eq.${userId})`
      );

    if (error1) throw error1;

    // Handle Stream chat cleanup
    try {
      // Connect to Stream Chat if not already connected
      if (!streamClient?.userID) {
        await connectToChat();
      }

      if (streamClient?.userID) {
        // Remove the chat channel
        const channels = await streamClient.queryChannels({
          type: "messaging",
          members: { $in: [userId, friendId] },
        });

        for (const channel of channels) {
          await channel.delete();
        }
      }
    } catch (streamError) {
      console.error("[Database] Stream cleanup error:", streamError);
      // Don't throw here - the friend removal was successful
    }

    return true;
  } catch (error) {
    console.error("[Database] removeFriend error:", error);
    throw error;
  }
};

// Get friendship status between two users
export const getFriendshipStatus = async (userId, otherUserId) => {
  try {
    const { data, error } = await supabase
      .from("user_connections")
      .select("status")
      .eq("user_id", userId)
      .eq("connected_user_id", otherUserId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (!data) {
      // Also check the reverse direction for pending requests
      const { data: reverseData, error: reverseError } = await supabase
        .from("user_connections")
        .select("status")
        .eq("user_id", otherUserId)
        .eq("connected_user_id", userId)
        .single();

      if (reverseError && reverseError.code !== "PGRST116") throw reverseError;

      if (reverseData && reverseData.status === "pending") {
        return "incoming_request";
      }
    }

    return data ? data.status : null;
  } catch (error) {
    console.error("[Database] getFriendshipStatus error:", error);
    throw error;
  }
};

// Get friend counts
export const getFriendCounts = async (userId) => {
  try {
    // Count accepted connections
    const { data, error } = await supabase
      .from("user_connections")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("status", "accepted");

    if (error) throw error;

    // Count pending requests received
    const { data: pendingData, error: pendingError } = await supabase
      .from("user_connections")
      .select("id", { count: "exact" })
      .eq("connected_user_id", userId)
      .eq("status", "pending");

    if (pendingError) throw pendingError;

    return {
      friends: data.length,
      pendingRequests: pendingData.length,
    };
  } catch (error) {
    console.error("[Database] getFriendCounts error:", error);
    throw error;
  }
};

// ==========================
// Community Methods
// ==========================
export const createCommunity = async (communityData) => {
  try {
    const { data, error } = await supabase
      .from("communities")
      .insert([communityData])
      .select()
      .single();

    if (error) throw error;

    // Create initial membership for the creator
    const { error: membershipError } = await supabase
      .from("community_members")
      .insert([
        {
          community_id: data.id,
          user_id: communityData.created_by,
          role: "admin",
          joined_at: new Date().toISOString(),
        },
      ]);

    if (membershipError) throw membershipError;

    return data;
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
};

export const updateCommunityBanner = async (communityId, file) => {
  try {
    // Validate file type
    const validFileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validFileTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and GIF are allowed."
      );
    }

    // Generate a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${communityId}-${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const filePath = fileName;

    // Upload the file to the storage bucket
    const { error: uploadError } = await supabase.storage
      .from("community-banners")
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("community-banners").getPublicUrl(filePath);

    // Update the community with the new banner URL
    const { data, error } = await supabase
      .from("communities")
      .update({ banner_url: publicUrl })
      .eq("id", communityId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("[updateCommunityBanner] error:", error);
    throw error;
  }
};

export const getCommunities = async () => {
  try {
    const { data, error } = await supabase.from("communities").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] getCommunities error:", error);
    throw error;
  }
};

export const getCommunity = async (communityId) => {
  try {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] getCommunity error:", error);
    throw error;
  }
};

export const joinCommunity = async (communityId, userId) => {
  try {
    const { data, error } = await supabase.from("community_members").insert({
      community_id: communityId,
      user_id: userId,
      joined_at: new Date().toISOString(),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] joinCommunity error:", error);
    throw error;
  }
};

export const leaveCommunity = async (communityId, userId) => {
  try {
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[Database] leaveCommunity error:", error);
    throw error;
  }
};

// ==========================
// Discussion Methods
// ==========================

// Renamed to createPost for clarity and added imageFile parameter
export const createPost = async ({
  communityId,
  userId,
  content,
  imageFile = null, // Optional image file
}) => {
  try {
    if (!content?.trim() && !imageFile) {
      throw new Error("Post must contain content or an image.");
    }

    let imageUrl = null;

    // Upload image if provided
    if (imageFile) {
      console.log("[Database] Uploading post image...");
      // Generate a unique file name (e.g., userId-timestamp.ext)
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // Store in root of bucket for now

      // Upload to the 'dicussion-posts' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("dicussion-posts") // Correct bucket name
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false, // Don't upsert, filenames should be unique
        });

      if (uploadError) {
        console.error("[Database] Image upload error:", uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("dicussion-posts") // Correct bucket name
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.warn(
          "[Database] Could not get public URL for uploaded image:",
          filePath
        );
        // Decide if this is a fatal error? Maybe proceed without image URL?
        // For now, let's throw an error.
        throw new Error("Failed to get image URL after upload.");
      }
      imageUrl = urlData.publicUrl;
      console.log("[Database] Image uploaded successfully:", imageUrl);
    }

    // Insert post data into discussions table
    console.log("[Database] Inserting post into discussions table...");
    const { data, error: insertError } = await supabase
      .from("discussions")
      .insert({
        community_id: communityId,
        user_id: userId,
        content: content || "", // Ensure content is at least an empty string
        image_url: imageUrl, // Include the image URL (null if no image)
        created_at: new Date().toISOString(),
        // You might want to add other fields like 'type' = 'post' if needed
      })
      .select(
        `
        *,
        profiles:user_id (id, username, avatar_url)
      ` // Select related profile too
      )
      .single(); // Expecting a single row back

    if (insertError) {
      console.error("[Database] Error inserting post:", insertError);
      throw insertError;
    }

    console.log("[Database] Post created successfully:", data.id);
    return data; // Return the newly created post data with profile
  } catch (error) {
    console.error("[Database] createPost error:", error);
    // Re-throw the error so the component can catch it
    throw error;
  }
};

export const getCommunityDiscussions = async (communityId) => {
  try {
    console.log(
      `[Database] Fetching discussions for community: ${communityId}`
    );

    const { data, error } = await supabase
      .from("discussions")
      .select(
        `
        *,
        profiles!discussions_user_id_fkey1 (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Database] Error fetching discussions:", error);
      throw error;
    }

    console.log(
      `[Database] Successfully fetched ${data?.length || 0} discussions`
    );
    return data;
  } catch (error) {
    console.error("[Database] getCommunityDiscussions error:", error);
    throw error;
  }
};

export const sendConnectionRequest = async (userId, targetUserId) => {
  try {
    const { data, error } = await supabase
      .from("user_connections")
      .insert({
        user_id: userId,
        connected_user_id: targetUserId,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] sendConnectionRequest error:", error);
    throw error;
  }
};

export const getConnectionStatus = async (userId, otherUserId) => {
  try {
    const { data, error } = await supabase
      .from("user_connections")
      .select("status")
      .eq("user_id", userId)
      .eq("connected_user_id", otherUserId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"

    return data ? data.status : "none";
  } catch (error) {
    console.error("[Database] getConnectionStatus error:", error);
    throw error;
  }
};
// ==========================
// Search Methods
// ==========================

// IMPORTANT: Search functionality has been moved to searchService.js
// Import search functions from '../services/searchService' instead
// This includes:
// - searchUsersByUsername
// - searchCommunities
// - searchAll

// ==========================
// Reading Activity Methods
// ==========================
/*export const createReadingActivity = async (userId, activityData) => {
  try {
    const { data, error } = await supabase
      .from("reading_activities")
      .insert({
        user_id: userId,
        ...activityData,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] createReadingActivity error:", error);
    throw error;
  }
};

export const getReadingActivities = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("reading_activities")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Database] getReadingActivities error:", error);
    throw error;
  }
};*/

// ==========================
// User Methods
// ==========================

// Note: getAllUsers has been moved to searchService.js
// Please import it from '../services/searchService' instead

// Get pending friend requests for a user
export const getPendingFriendRequests = async (userId) => {
  try {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("user_connections")
      .select(
        `
        status,
        created_at,
        user_id,
        connected_user_id,
        profiles:user_id(id, username, avatar_url)
      `
      )
      .eq("connected_user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Database] getPendingFriendRequests error:", error);
    return [];
  }
};

// Alias for getPendingFriendRequests to maintain compatibility with components using getFriendRequests
export const getFriendRequests = getPendingFriendRequests;

// Combined function to respond to friend requests (accept or reject)
export const respondToFriendRequest = async (
  userId,
  requesterId,
  accept = true
) => {
  try {
    if (!userId || !requesterId) return false;

    if (accept) {
      return await acceptFriendRequest(userId, requesterId);
    } else {
      return await rejectFriendRequest(userId, requesterId);
    }
  } catch (error) {
    console.error("[Database] respondToFriendRequest error:", error);
    return false;
  }
};

// For backward compatibility - alias getProfile as getUser
export const getUser = getProfile;

// Get communities that a user is a member of
export const getUserCommunities = async (userId) => {
  try {
    if (!userId) return [];

    // First, check the structure of the communities table
    const { data: tableInfo, error: tableError } = await supabase
      .from("communities")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("[Database] Error checking communities table:", tableError);
      throw tableError;
    }

    // Determine if image_url exists
    const sampleCommunity = tableInfo?.[0] || {};
    const hasImageUrl = Object.keys(sampleCommunity).includes("image_url");

    // Build the select query based on available columns
    const selectQuery = `
      community_id,
      joined_at,
      communities:community_id(
        id, 
        name, 
        description, 
        ${hasImageUrl ? "image_url," : ""} 
        created_at,
        created_by
      )
    `;

    const { data, error } = await supabase
      .from("community_members")
      .select(selectQuery)
      .eq("user_id", userId)
      .order("joined_at", { ascending: false });

    if (error) throw error;

    // Restructure the data to return just the communities with member_since field added
    return (
      data?.map((item) => ({
        ...item.communities,
        member_since: item.joined_at,
        // Ensure image_url exists (use null if not present)
        image_url: item.communities?.image_url || null,
      })) || []
    );
  } catch (error) {
    console.error("[Database] getUserCommunities error:", error);
    return [];
  }
};

// Comments functionality
export const createComment = async (
  discussionId,
  content,
  parentCommentId = null
) => {
  try {
    if (!discussionId || !content) return null;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error("User not found.");

    const { data, error } = await supabase
      .from("comments")
      .insert({
        discussion_id: discussionId,
        user_id: user.id,
        content,
        parent_comment_id: parentCommentId,
      })
      .select("*, profiles!comments_user_id_fkey1(username, avatar_url)");

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error("[Database] createComment error:", error);
    return null;
  }
};

export const getCommentsByDiscussionId = async (
  discussionId,
  limit = 50,
  offset = 0
) => {
  try {
    if (!discussionId) return [];

    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles!comments_user_id_fkey1(username, avatar_url)")
      .eq("discussion_id", discussionId)
      .is("parent_comment_id", null) // Get only top-level comments
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Database] getCommentsByDiscussionId error:", error);
    return [];
  }
};

export const getCommentReplies = async (commentId, limit = 20, offset = 0) => {
  try {
    if (!commentId) return [];

    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles!comments_user_id_fkey1(username, avatar_url)")
      .eq("parent_comment_id", commentId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Database] getCommentReplies error:", error);
    return [];
  }
};

export const updateComment = async (commentId, content) => {
  try {
    if (!commentId || !content) return false;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error("User not found.");

    const { error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[Database] updateComment error:", error);
    return false;
  }
};

export const deleteComment = async (commentId) => {
  try {
    if (!commentId) return false;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error("User not found.");

    // Soft delete
    const { error } = await supabase
      .from("comments")
      .update({ is_deleted: true })
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[Database] deleteComment error:", error);
    return false;
  }
};

// Reactions functionality
export const reactToDiscussion = async (discussionId, reactionType) => {
  try {
    if (!discussionId || !reactionType) return false;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error("User not found.");
    const userId = user.id;

    // First get the current reactions
    const { data: discussion, error: fetchError } = await supabase
      .from("discussions")
      .select("reactions")
      .eq("id", discussionId)
      .single();

    if (fetchError) throw fetchError;

    const currentReactions = discussion?.reactions || {};

    // Update reactions
    const userReactions = currentReactions[userId] || [];

    // Toggle reaction
    const hasReaction = userReactions.includes(reactionType);
    const updatedUserReactions = hasReaction
      ? userReactions.filter((r) => r !== reactionType)
      : [...userReactions, reactionType];

    const updatedReactions = {
      ...currentReactions,
      [userId]: updatedUserReactions.length ? updatedUserReactions : null,
    };

    // Remove null entries
    Object.keys(updatedReactions).forEach((key) => {
      if (!updatedReactions[key]) {
        delete updatedReactions[key];
      }
    });

    // Update the discussion
    const { error } = await supabase
      .from("discussions")
      .update({ reactions: updatedReactions })
      .eq("id", discussionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[Database] reactToDiscussion error:", error);
    return false;
  }
};

export const reactToComment = async (commentId, reactionType) => {
  try {
    if (!commentId || !reactionType) return false;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error("User not found.");
    const userId = user.id;

    // First get the current reactions
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("reactions")
      .eq("id", commentId)
      .single();

    if (fetchError) throw fetchError;

    const currentReactions = comment?.reactions || {};

    // Update reactions
    const userReactions = currentReactions[userId] || [];

    // Toggle reaction
    const hasReaction = userReactions.includes(reactionType);
    const updatedUserReactions = hasReaction
      ? userReactions.filter((r) => r !== reactionType)
      : [...userReactions, reactionType];

    const updatedReactions = {
      ...currentReactions,
      [userId]: updatedUserReactions.length ? updatedUserReactions : null,
    };

    // Remove null entries
    Object.keys(updatedReactions).forEach((key) => {
      if (!updatedReactions[key]) {
        delete updatedReactions[key];
      }
    });

    // Update the comment
    const { error } = await supabase
      .from("comments")
      .update({ reactions: updatedReactions })
      .eq("id", commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[Database] reactToComment error:", error);
    return false;
  }
};

// Add a new function to get chat channels for a user
export const getUserChatChannels = async (userId) => {
  try {
    // Connect to Stream Chat if not already connected
    if (!streamClient.userID) {
      await connectToChat();
    }

    // Get all channels where the user is a member
    const channels = await streamClient.queryChannels(
      { type: "messaging", members: { $in: [userId] } },
      { last_message_at: -1 },
      { watch: true, state: true }
    );

    return channels;
  } catch (error) {
    console.error("[Database] getUserChatChannels error:", error);
    throw error;
  }
};

// Get friends list with profiles
export const getFriends = async (userId) => {
  try {
    if (!userId) return [];
    assertUuid(userId, "userId");

    console.log(`[Database] Fetching friend connections for user: ${userId}`);

    // Step 1: Get ONLY the IDs from accepted connections
    const { data: connections, error: connectionError } = await supabase
      .from("user_connections")
      .select("user_id, connected_user_id") // Select only IDs
      .eq("status", "accepted")
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

    if (connectionError) {
      console.error(
        "[Database] Error fetching friend connections:",
        connectionError
      );
      throw connectionError;
    }

    if (!connections || connections.length === 0) {
      console.log(`[Database] No connections found for user ${userId}`);
      return [];
    }

    console.log(
      `[Database] Found ${connections.length} connection rows for user ${userId}. Fetching profiles...`
    );

    // Step 2: Extract unique friend IDs
    const friendIds = connections.map((conn) => {
      return conn.user_id === userId ? conn.connected_user_id : conn.user_id;
    });
    const uniqueFriendIds = [...new Set(friendIds)]; // Ensure uniqueness

    if (uniqueFriendIds.length === 0) {
      return [];
    }

    // Step 3: Fetch profiles for each unique friend ID individually
    console.log(
      `[Database] Attempting to fetch profiles for IDs: ${uniqueFriendIds.join(
        ", "
      )}`
    );

    // *** ADDED: Get current session data ***
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      console.error(
        "[Database] Error getting session before profile fetch:",
        sessionError
      );
      // Decide how to handle this - maybe return [] or throw?
      return [];
    }
    const currentAccessToken = sessionData.session.access_token;
    // *** END ADDED ***

    const profilePromises = uniqueFriendIds.map(async (friendId) => {
      try {
        console.log(`[Database] Fetching profile for ID: ${friendId}`);
        // Use the simplest select query for a single profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, bio")
          .eq("id", friendId)
          // *** ADDED: Explicitly set Authorization header ***
          // Note: This overrides the default client auth handling for this specific request
          // Usually not needed, but helps diagnose session state issues.
          // We might need to handle RLS differently if bypassing normal auth flow.
          // Let's try without header override first, just confirming session exists.
          .maybeSingle();

        if (profileError) {
          // Log specific error for this ID
          console.error(
            `[Database] Error fetching profile for friend ID ${friendId}:`,
            JSON.stringify(profileError, null, 2)
          );
          return null; // Return null if fetching this specific profile failed
        }

        // Log success or if null was returned
        if (profile) {
          console.log(
            `[Database] Successfully fetched profile for ID: ${friendId}`
          );
        } else {
          console.log(
            `[Database] No profile found (null returned) for ID: ${friendId}`
          );
        }
        return profile; // Return the successfully fetched profile or null
      } catch (err) {
        // Log specific exception for this ID
        console.error(
          `[Database] Exception fetching profile for friend ID ${friendId}:`,
          err
        );
        return null;
      }
    });

    // Wait for all profile fetches to complete
    const friendsProfiles = await Promise.all(profilePromises);

    // Filter out any null results (where profile fetch failed)
    const validFriends = friendsProfiles.filter(Boolean);

    console.log(
      `[Database] Retrieved ${validFriends.length} friend profiles for user ${userId}`
    );
    return validFriends; // Return the array of fetched profiles
  } catch (error) {
    // Catch errors from the initial connection fetch or Promise.all
    console.error("[Database] getFriends general error:", error);
    return [];
  }
};
