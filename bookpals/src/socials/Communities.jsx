import React, { useState, useEffect, useCallback } from "react";
import {
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
} from "../services/database";

const ITEMS_PER_PAGE = 10;

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Memoize fetch function
  const fetchCommunities = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const data = await getCommunities();

      // Simple pagination implementation
      const start = (pageNum - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginatedData = data.slice(start, end);

      if (pageNum === 1) {
        setCommunities(paginatedData);
      } else {
        setCommunities((prev) => [...prev, ...paginatedData]);
      }

      setHasMore(data.length > end);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCommunities(1);
  }, [fetchCommunities]);

  // Load more function
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCommunities(nextPage);
    }
  };

  // Optimized community selection
  const handleSelectCommunity = async (communityId) => {
    try {
      setLoading(true);
      // First check if we already have the community data
      const existingCommunity = communities.find((c) => c.id === communityId);
      if (existingCommunity && existingCommunity.description) {
        setSelectedCommunity(existingCommunity);
      } else {
        // Only fetch if we need more details
        const community = await getCommunity(communityId);
        setSelectedCommunity(community);
        // Update the community in our list with full details
        setCommunities((prev) =>
          prev.map((c) => (c.id === communityId ? community : c))
        );
      }
    } catch (error) {
      console.error("Error selecting community:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId) => {
    try {
      await joinCommunity(communityId);
      // Update local state to reflect the change
      setCommunities((prev) =>
        prev.map((c) => (c.id === communityId ? { ...c, isMember: true } : c))
      );
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  const handleLeave = async (communityId) => {
    try {
      await leaveCommunity(communityId);
      // Update local state to reflect the change
      setCommunities((prev) =>
        prev.map((c) => (c.id === communityId ? { ...c, isMember: false } : c))
      );
    } catch (error) {
      console.error("Error leaving community:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {loading && <p>Loading...</p>}

      {!selectedCommunity ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">All Communities</h2>
          <ul className="space-y-4">
            {communities.map((c) => (
              <li key={c.id} className="border p-4 rounded-lg">
                <h3 className="text-xl font-semibold">{c.name}</h3>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleSelectCommunity(c.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Load More
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedCommunity.name}</h2>
          <p className="text-gray-600 mb-4">{selectedCommunity.description}</p>
          <div className="space-x-4">
            <button
              onClick={() => handleJoin(selectedCommunity.id)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Join
            </button>
            <button
              onClick={() => handleLeave(selectedCommunity.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Leave
            </button>
            <button
              onClick={() => setSelectedCommunity(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;
