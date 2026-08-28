import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
import { getPreferences, getCommunities } from "./database";

// Scoring lives in the match_users RPC (supabase/migrations/0002_matching.sql) -
// this hook is just the fetch + cache wrapper.
export function useMatches(userId, limit = 20) {
  return useQuery({
    queryKey: ["matches", userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("match_users", {
        p_user_id: userId,
        p_limit: limit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Function to get recommended communities based on genre overlap
export const getRecommendedCommunities = async (userId, limit = 5) => {
  if (!userId) return [];

  try {
    // 1. Get user's favorite genres
    const { data: prefs, error: prefsError } = await getPreferences(userId);
    if (prefsError) {
      console.error("[RecSvc Comm] Error fetching preferences:", prefsError);
      return [];
    }
    const userGenres = new Set(prefs?.favorite_genres || []);
    if (userGenres.size === 0) {
      console.log("[RecSvc Comm] User has no favorite genres set.");
      return [];
    }

    // 2. Get all communities (ensure 'genre' is selected)
    const communities = await getCommunities();
    if (!communities || communities.length === 0) {
      console.log("[RecSvc Comm] No communities found.");
      return [];
    }

    // 3. Calculate match score for each community
    const scoredCommunities = communities.map((community) => {
      let communityGenres = [];
      if (Array.isArray(community.genre)) {
        communityGenres = community.genre;
      } else if (
        typeof community.genre === "string" &&
        community.genre.trim() !== ""
      ) {
        communityGenres = community.genre.split(",").map((g) => g.trim());
      }

      let matchScore = 0;
      communityGenres.forEach((genre) => {
        if (userGenres.has(genre)) {
          matchScore++;
        }
      });

      return { ...community, score: matchScore };
    });

    // 4. Filter out communities with zero score and sort by score
    const recommended = scoredCommunities
      .filter((community) => community.score > 0)
      .sort((a, b) => b.score - a.score); // Sort descending by score

    // 5. Return top N
    console.log(
      `[RecSvc Comm] Found ${recommended.length} potential recommendations, returning top ${limit}.`
    );
    return recommended.slice(0, limit);
  } catch (error) {
    console.error(
      "[RecSvc Comm] Error getting recommended communities:",
      error
    );
    return []; // Return empty array on error
  }
};
