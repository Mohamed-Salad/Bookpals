// src/services/searchService.js
import { supabase } from "./supabaseClient";

/**
 * Search Service - Centralized location for all search functionality
 * Handles searching across users, communities, and other content
 */

// Get all users with optional limit and pagination
export const getAllUsers = async (limit = 100, page = 0) => {
  try {
    console.log("[SearchService] Fetching all users...");

    // First check if there are any users at all - diagnostic check
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("[SearchService] Error counting users:", countError);
    } else {
      console.log(`[SearchService] Total user count in database: ${count}`);
    }

    // Now fetch the actual users with pagination
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("username")
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error("[SearchService] Error fetching users:", error);
      throw error;
    }

    console.log(`[SearchService] Retrieved ${data?.length || 0} users`);

    // Log the first few users for debugging
    if (data && data.length > 0) {
      console.log(
        "[SearchService] Sample users:",
        data.slice(0, 3).map((u) => ({
          id: u.id,
          username: u.username,
          has_avatar: !!u.avatar_url,
        }))
      );
    } else {
      console.warn("[SearchService] Warning: No users found");
    }

    return data || [];
  } catch (error) {
    console.error("[SearchService] getAllUsers error:", error);
    return []; // Return empty array on error rather than throwing
  }
};

// Search for users by username or bio
export const searchUsers = async (query) => {
  try {
    // More comprehensive search with better error handling
    if (!query.trim()) return [];

    // Log what we're attempting to search
    console.log(`[SearchService] Searching users with query: "${query}"`);

    // More thorough search - look in username, bio, first_name, last_name, etc.
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, bio, avatar_url, first_name, last_name, reading_type, favorite_genres"
      )
      .or(
        `username.ilike.%${query}%, bio.ilike.%${query}%, first_name.ilike.%${query}%, last_name.ilike.%${query}%`
      )
      .limit(30);

    if (error) {
      console.error("[SearchService] searchUsers error:", error);
      throw error;
    }

    // Log the search results for debugging
    console.log(
      `[SearchService] Found ${data?.length || 0} users for query: "${query}"`
    );
    if (data && data.length > 0) {
      console.log(
        "[SearchService] First few matching users:",
        data.slice(0, 3).map((u) => ({ id: u.id, username: u.username }))
      );
    } else {
      console.warn(`[SearchService] No users found for query: "${query}"`);
    }

    return data || [];
  } catch (error) {
    console.error("[SearchService] searchUsers error:", error);
    return []; // Return empty array instead of throwing to prevent UI breaking
  }
};

// Direct user search by username only (used by SimpleUserSearch component)
export const searchUsersByUsername = async (username) => {
  try {
    console.log(
      `[SearchService] Directly searching for username: "${username}"`
    );

    if (!username.trim()) return [];

    // First check how many total users are in the database
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("[SearchService] Error counting users:", countError);
    } else {
      console.log(`[SearchService] Total user count in database: ${count}`);
    }

    // Use a more flexible search pattern with multiple column matching
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(
        `username.ilike.%${username}%, bio.ilike.%${username}%, first_name.ilike.%${username}%, last_name.ilike.%${username}%`
      )
      .limit(30);

    if (error) {
      console.error("[SearchService] Direct user search error:", error);
      throw error;
    }

    console.log(
      `[SearchService] Direct search found ${
        data?.length || 0
      } users matching "${username}"`
    );

    if (data && data.length > 0) {
      console.log(
        "[SearchService] Found users:",
        data.map((u) => u.username)
      );
    } else {
      // If no users found with the advanced search, try a simpler exact match
      console.warn(
        `[SearchService] No users found with pattern search, trying exact match...`
      );

      const { data: exactData, error: exactError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .limit(5);

      if (exactError) {
        console.error("[SearchService] Exact search error:", exactError);
      } else if (exactData && exactData.length > 0) {
        console.log(
          `[SearchService] Found ${exactData.length} users with exact match`
        );
        return exactData;
      } else {
        // As a fallback, return a few users anyway for testing
        console.log(
          `[SearchService] No exact matches, attempting to return some users for testing...`
        );

        const { data: someUsers, error: someError } = await supabase
          .from("profiles")
          .select("*")
          .limit(5);

        if (someError) {
          console.error("[SearchService] Failed to get any users:", someError);
        } else if (someUsers && someUsers.length > 0) {
          console.log(
            `[SearchService] Returning ${someUsers.length} sample users`
          );
          return someUsers;
        }
      }
    }

    return data || [];
  } catch (error) {
    console.error("[SearchService] searchUsersByUsername error:", error);
    return [];
  }
};

// Search for communities by name or description
export const searchCommunities = async (searchTerm) => {
  try {
    console.log(`[SearchService] Searching communities for: "${searchTerm}"`);

    if (!searchTerm.trim()) {
      // For empty searches, return a few communities as samples
      const { data: allCommunities, error: allError } = await supabase
        .from("communities")
        .select("*")
        .limit(5);

      if (allError) {
        console.error(
          "[SearchService] Error getting sample communities:",
          allError
        );
        return [];
      }

      console.log(
        `[SearchService] Returning ${
          allCommunities?.length || 0
        } sample communities`
      );
      return allCommunities || [];
    }

    // First check what columns exist in the communities table
    const { data: columns, error: columnsError } = await supabase
      .from("communities")
      .select()
      .limit(1);

    if (columnsError) {
      console.error(
        "[SearchService] Error checking community columns:",
        columnsError
      );

      // Get table info instead
      const { data: tableData, error: tableError } = await supabase
        .from("communities")
        .select("*")
        .limit(3);

      if (tableError) {
        console.error("[SearchService] Table info error:", tableError);
        return [];
      }

      console.log(
        "[SearchService] Found communities without filtering:",
        tableData?.length || 0
      );
      return tableData || [];
    }

    const sampleCommunity = columns?.[0] || {};
    console.log(
      "[SearchService] Community table columns:",
      Object.keys(sampleCommunity)
    );

    // Safely query communities with only existing columns
    const selectColumns = [
      "id",
      "name",
      "description",
      "is_private",
      "genre",
      "member_count",
      "background_image",
      "created_by",
      "created_at",
    ]
      .filter((col) => col in sampleCommunity)
      .join(", ");

    if (!selectColumns) {
      console.error(
        "[SearchService] No valid columns found in communities table"
      );
      return [];
    }

    console.log(
      `[SearchService] Selecting community columns: ${selectColumns}`
    );

    // Build the OR condition based on available columns
    const searchableColumns = ["name", "description", "genre"].filter(
      (col) => col in sampleCommunity
    );

    if (searchableColumns.length === 0) {
      console.error(
        "[SearchService] No searchable columns found in communities table"
      );
      return [];
    }

    const orConditions = searchableColumns
      .map((col) => `${col}.ilike.%${searchTerm}%`)
      .join(",");

    console.log(`[SearchService] Using search conditions: ${orConditions}`);

    const { data, error } = await supabase
      .from("communities")
      .select(selectColumns)
      .or(orConditions)
      .limit(10);

    if (error) {
      console.error("[SearchService] Communities search error:", error);
      return [];
    }

    console.log(
      `[SearchService] Found ${
        data?.length || 0
      } communities matching "${searchTerm}"`
    );

    // If no communities found, try getting a few recent ones
    if (!data || data.length === 0) {
      console.log(
        "[SearchService] No matching communities, getting recent ones"
      );
      const { data: recentData, error: recentError } = await supabase
        .from("communities")
        .select(selectColumns)
        .limit(5);

      if (recentError) {
        console.error(
          "[SearchService] Error getting recent communities:",
          recentError
        );
        return [];
      }

      console.log(
        `[SearchService] Found ${recentData?.length || 0} recent communities`
      );
      return recentData || [];
    }

    return data || [];
  } catch (error) {
    console.error("[SearchService] searchCommunities error:", error);
    return [];
  }
};

// Combined search function
export const searchAll = async (query) => {
  try {
    if (!query.trim()) {
      return {
        users: [],
        communities: [],
      };
    }

    console.log(`[SearchService] Performing combined search for: "${query}"`);

    const [users, communities] = await Promise.all([
      searchUsersByUsername(query),
      searchCommunities(query),
    ]);

    console.log(
      `[SearchService] Combined search results: ${users.length} users, ${communities.length} communities`
    );

    return {
      users: users || [],
      communities: communities || [],
    };
  } catch (error) {
    console.error("[SearchService] searchAll error:", error);
    // Return empty results instead of breaking
    return {
      users: [],
      communities: [],
    };
  }
};

export const getUserCommunityMemberships = async (userId) => {
  try {
    console.log("[SearchService] Fetching user community memberships...");

    const { data, error } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", userId);

    if (error) {
      console.error("[SearchService] Error fetching memberships:", error);
      throw error;
    }

    const membershipIds = data.map((item) => item.community_id);
    console.log(
      `[SearchService] User is member of ${membershipIds.length} communities`
    );

    return membershipIds;
  } catch (error) {
    console.error("[SearchService] getUserCommunityMemberships error:", error);
    return [];
  }
};

export const getAllCommunities = async (limit = 50, page = 0) => {
  try {
    console.log(
      "[SearchService] Fetching communities (tailored for Discover)..."
    );

    // Fetch communities with specific columns needed by CommunityCard
    const { data, error } = await supabase
      .from("communities")
      .select(
        `
        id,
        name,
        description,
        genre,
        member_count,
        is_private,
        banner_url,
        category
      `
      )
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error("[SearchService] Error fetching communities:", error);
      throw error;
    }

    console.log(`[SearchService] Retrieved ${data?.length || 0} communities`);
    return data || [];
  } catch (error) {
    console.error("[SearchService] getAllCommunities error:", error);
    return [];
  }
};
