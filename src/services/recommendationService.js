import { supabase } from "./supabaseClient";
import { getFriends, getPreferences, getCommunities } from "./database";

// Temporarily comment out weights for more inclusive matching during testing
// const WEIGHTS = {
//   favorite_genres: 5,
//   reading_type: 3,
//   reading_frequency: 2,
//   preferred_reading_time: 1,
//   preferred_reading_format: 1
// };

// Format preference values for display
function formatPreferenceValue(key, value) {
  const capitalize = (str) =>
    str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  switch (key) {
    case "reading_type":
      return capitalize(value);
    case "reading_frequency":
      return capitalize(value);
    case "preferred_reading_time":
      return capitalize(value);
    case "preferred_reading_format":
      return capitalize(value);
    default:
      return value;
  }
}

async function getRecommendedUsers(userId, limit = 4) {
  if (!userId) throw new Error("User ID is required");

  try {
    console.log(
      "[RecommendationService] Starting recommendation process for user:",
      userId
    );

    // Get current user's friends and preferences
    const [friends, { data: currentUserPrefs }] = await Promise.all([
      getFriends(userId),
      supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single(),
    ]);

    if (!currentUserPrefs) {
      console.warn(
        "[RecommendationService] No preferences found for user:",
        userId
      );
      throw new Error("User preferences not found");
    }

    console.log("[RecommendationService] Current user preferences:", {
      genres: currentUserPrefs.favorite_genres,
      type: currentUserPrefs.reading_type,
      frequency: currentUserPrefs.reading_frequency,
    });

    const friendIds = [...friends.map((f) => f.id), userId];
    console.log("[RecommendationService] Excluding friends:", friendIds);

    // Get all potential matches with debug logging
    console.log("[RecommendationService] Fetching potential matches...");
    const { data: recommendations, error } = await supabase
      .from("user_preferences")
      .select(
        `
        user_id,
        reading_frequency,
        reading_type,
        preferred_reading_time,
        preferred_reading_format,
        favorite_genres
      `
      )
      .neq("user_id", userId)
      .in("user_id", friendIds, { not: true })
      .limit(50);

    if (error) {
      console.error("[RecommendationService] Supabase query error:", error);
      throw error;
    }

    if (!recommendations?.length) {
      console.warn("[RecommendationService] No potential matches found");
      return [];
    }

    // Fetch user details separately to ensure we have complete data
    const userIds = recommendations.map((rec) => rec.user_id);
    const { data: users, error: userError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio, reading_type")
      .in("id", userIds);

    if (userError) {
      console.error(
        "[RecommendationService] Error fetching user details:",
        userError
      );
      throw userError;
    }

    // Create a map of user details for easy lookup
    const userMap = new Map(users.map((user) => [user.id, user]));

    console.log(
      "[RecommendationService] Found users:",
      users.length,
      "for",
      recommendations.length,
      "recommendations"
    );

    // Simplified matching logic - match on any shared preference
    const scoredRecommendations = recommendations
      .map((rec) => {
        const userData = userMap.get(rec.user_id);
        if (!userData) {
          console.warn(
            `[RecommendationService] Missing user data for ID: ${rec.user_id}`
          );
          return null;
        }

        let matchingPrefs = [];

        // Check for matching genres
        if (rec.favorite_genres && currentUserPrefs.favorite_genres) {
          const matchingGenres = rec.favorite_genres.filter((genre) =>
            currentUserPrefs.favorite_genres.includes(genre)
          );
          if (matchingGenres.length > 0) {
            matchingPrefs.push({
              type: "genres",
              count: matchingGenres.length,
            });
            console.log(
              `[RecommendationService] Found ${matchingGenres.length} matching genres for user ${userData.id}`
            );
          }
        }

        // Check all other preferences for any matches
        const preferencesToCheck = [
          "reading_type",
          "reading_frequency",
          "preferred_reading_time",
          "preferred_reading_format",
        ];

        preferencesToCheck.forEach((key) => {
          if (
            rec[key] &&
            currentUserPrefs[key] &&
            rec[key] === currentUserPrefs[key]
          ) {
            matchingPrefs.push({
              type: key,
              value: formatPreferenceValue(key, rec[key]),
            });
            console.log(
              `[RecommendationService] Found matching ${key} for user ${userData.id}: ${rec[key]}`
            );
          }
        });

        // Calculate simple score based on number of matches
        const matchCount = matchingPrefs.length;
        const maxPossibleMatches = preferencesToCheck.length + 1; // +1 for genres
        const baseScore = Math.round((matchCount / maxPossibleMatches) * 100);

        // Give at least 30% score if there's any match
        const finalScore = matchCount > 0 ? Math.max(baseScore, 30) : 0;

        return {
          user: {
            id: userData.id,
            username: userData.username,
            avatar_url: userData.avatar_url || null,
            bio: userData.bio || null,
            reading_type: userData.reading_type || null,
          },
          matchScore: finalScore,
          matchingPreferences: {
            reading_type: rec.reading_type || null,
            reading_frequency: rec.reading_frequency || null,
            preferred_reading_time: rec.preferred_reading_time || null,
            preferred_reading_format: rec.preferred_reading_format || null,
            favorite_genres: rec.favorite_genres || [],
          },
          currentUserPreferences: currentUserPrefs,
          matchingGenres:
            rec.favorite_genres?.filter((genre) =>
              currentUserPrefs.favorite_genres?.includes(genre)
            ) || [],
          matchDetails: matchingPrefs,
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    console.log(
      "[RecommendationService] Returning",
      scoredRecommendations.length,
      "recommendations"
    );

    return scoredRecommendations;
  } catch (error) {
    console.error(
      "[RecommendationService] Error getting recommended users:",
      error
    );
    throw new Error("Failed to get recommended users");
  }
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

export { getRecommendedUsers };
