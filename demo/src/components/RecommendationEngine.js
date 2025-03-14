import { supabase } from '../Supabase';

export const recommendationEngine = {
  getRecommendedUsers: async (userId) => {
    try {
      // 1. Get current user's profile
      const { data: currentUser, error: userError } = await supabase
        .from('profiles')
        .select('readingType, readingFrequency, interests')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // 2. Get potential matches
      const { data: potentialMatches, error: matchError } = await supabase
        .from('profiles')
        .select('id, readingType, readingFrequency, interests')
        .neq('id', userId);

      if (matchError) throw matchError;

      // 3. Calculate recommendations
      const recommendations = potentialMatches.map(user => {
        // Basic score calculation
        let score = 0;
        
        // Same reading type (+2 points)
        if (user.readingType === currentUser.readingType) {
          score += 2;
        }
        
        // Same reading frequency (+1 point)
        if (user.readingFrequency === currentUser.readingFrequency) {
          score += 1;
        }
        
        // Shared interests (+1 point per shared interest)
        const sharedInterests = user.interests?.filter(interest => 
          currentUser.interests?.includes(interest)
        ) || [];
        score += sharedInterests.length;

        return {
          userId: user.id,
          score,
          sharedInterests,
          readingTypeMatch: user.readingType === currentUser.readingType,
          frequencyMatch: user.readingFrequency === currentUser.readingFrequency
        };
      });

      // 4. Sort by score and return top matches
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Return top 10 matches

    } catch (error) {
      console.error('Error in recommendation engine:', error);
      return [];
    }
  }
}; 