import React, { useState, useEffect } from "react";
import { getRecommendedUsers } from "../../services/recommendationService";
import { useAuth } from "../../context/AuthContext";
import RecommendedUserCard from "./RecommendedUserCard";

export default function RecommendedUsers() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecommendedUsers(user.id);
        console.log("Recommendations loaded:", data); // Debug log
        if (!Array.isArray(data)) {
          throw new Error("Invalid recommendations data format");
        }
        setRecommendations(data.filter((rec) => rec && rec.user));
      } catch (err) {
        console.error("Error loading recommendations:", err);
        setError("Failed to load recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-700 font-medium">No Reader Matches Found</p>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p>To find matches, try:</p>
          <ul className="list-disc list-inside">
            <li>Adding more favorite genres</li>
            <li>Updating your reading preferences</li>
            <li>Checking back later for new readers</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Recommended Readers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((recommendation) => (
          <RecommendedUserCard
            key={recommendation.user.id}
            user={recommendation.user}
            matchScore={recommendation.matchScore}
            matchingPreferences={recommendation.matchingPreferences}
            matchingGenres={recommendation.matchingGenres || []}
            matchDetails={recommendation.matchDetails || []}
          />
        ))}
      </div>
    </div>
  );
}
