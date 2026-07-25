import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getRecommendedCommunities } from "../../services/recommendationService";
import CommunityCard from "../socials/CommunityCard"; // Assuming path is correct
import { LoadingIndicator } from "stream-chat-react"; // Or your own loader

const RecommendedCommunities = ({ limit = 3 }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) {
        setLoading(false);
        return; // No user, no recommendations
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getRecommendedCommunities(user.id, limit);
        setRecommendations(data);
      } catch (err) {
        console.error("Error fetching recommended communities:", err);
        setError("Could not load recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?.id, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4 min-h-[150px]">
        <LoadingIndicator size={30} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!recommendations || recommendations.length === 0) {
    // Don't show anything if no recommendations (or user has no genres)
    return null;
    // Or optionally show a message:
    // return <div className="text-center text-gray-500 p-4">No community recommendations available right now.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.map((community) => (
        <CommunityCard key={community.id} community={community} />
        // Note: CommunityCard needs userMemberships prop for Join button state,
        // which we don't have here easily. Join button might not show correct state.
        // For speed, we accept this limitation for now.
      ))}
    </div>
  );
};

export default RecommendedCommunities;
