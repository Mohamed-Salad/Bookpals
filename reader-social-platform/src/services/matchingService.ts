import { supabase } from '../config/supabaseConfig';
import { UserProfile } from '../config/supabaseConfig';

export interface MatchResult {
  user: UserProfile;
  matchScore: number;
  commonPreferences: string[];
  commonBooks: string[];
}

export interface MatchingError {
  message: string;
}

export const matchingService = {
  /**
   * Find users with similar reading preferences
   * @param userId - Current user's ID
   * @param limit - Maximum number of matches to return
   * @returns Promise with matched users or error
   */
  async findMatches(userId: string, limit: number = 10): Promise<{
    matches: MatchResult[];
    error: MatchingError | null;
  }> {
    try {
      // Get current user's profile
      const { data: currentUser, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Find users with matching preferences
      const { data: potentialMatches, error: matchesError } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', userId)
        .contains('reading_preferences', currentUser.reading_preferences)
        .limit(limit);

      if (matchesError) throw matchesError;

      // Calculate match scores and common interests
      const matches: MatchResult[] = potentialMatches.map((user: UserProfile) => {
        const commonPreferences = currentUser.reading_preferences.filter((pref: string): boolean =>
          user.reading_preferences.includes(pref)
        );
        const commonBooks = currentUser.favorite_books.filter((book: string): boolean =>
          user.favorite_books.includes(book)
        );

        // Calculate match score based on common preferences and books
        const preferenceScore = (commonPreferences.length / currentUser.reading_preferences.length) * 0.7;
        const bookScore = (commonBooks.length / currentUser.favorite_books.length) * 0.3;
        const matchScore = (preferenceScore + bookScore) * 100;

        return {
          user,
          matchScore,
          commonPreferences,
          commonBooks,
        };
      });

      // Sort matches by score in descending order
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return {
        matches,
        error: null,
      };
    } catch (error) {
      return {
        matches: [],
        error: {
          message: error instanceof Error ? error.message : 'Failed to find matches',
        },
      };
    }
  },

  /**
   * Find reading groups based on user preferences
   * @param userId - Current user's ID
   * @param limit - Maximum number of groups to return
   * @returns Promise with matched groups or error
   */
  async findMatchingGroups(userId: string, limit: number = 5): Promise<{
    groups: any[];
    error: MatchingError | null;
  }> {
    try {
      // Get current user's profile
      const { data: currentUser, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Find groups that match user's preferences
      const { data: groups, error: groupsError } = await supabase
        .from('reading_groups')
        .select('*')
        .contains('genre', currentUser.reading_preferences)
        .limit(limit);

      if (groupsError) throw groupsError;

      return {
        groups,
        error: null,
      };
    } catch (error) {
      return {
        groups: [],
        error: {
          message: error instanceof Error ? error.message : 'Failed to find matching groups',
        },
      };
    }
  },
}; 