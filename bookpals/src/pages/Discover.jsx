// src/pages/Discover.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  searchUsersByUsername,
  searchCommunities,
  searchAll,
  getAllUsers,
  getUserCommunityMemberships,
  getAllCommunities,
} from "../services/searchService";
import { useAuth } from "../context/AuthContext";
import UserCard from "../components/UserCard";
import { motion, AnimatePresence } from "framer-motion";
import CommunityCard from "../components/CommunityCard";
import { useChat } from "../context/ChatContext";
import CreateCommunityModal from "../pages/community/components/CreateCommunityModal";

// Tab selector component
const TabSelector = ({ activeTab, setActiveTab }) => (
  <div className="flex space-x-2 mb-6">
    <button
      onClick={() => setActiveTab("all")}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === "all"
          ? "bg-primary text-white"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      All
    </button>
    <button
      onClick={() => setActiveTab("readers")}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === "readers"
          ? "bg-primary text-white"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      Readers
    </button>
    <button
      onClick={() => setActiveTab("communities")}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === "communities"
          ? "bg-primary text-white"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      Communities
    </button>
  </div>
);

// Main Discover component
export default function Discover() {
  const location = useLocation();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], communities: [] });
  const [allUsers, setAllUsers] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userMemberships, setUserMemberships] = useState([]);
  const { isConnected } = useChat();

  // Load all users and communities on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        console.log("[Discover] Loading initial data...");

        // Load users and communities in parallel
        const [users, communities] = await Promise.all([
          getAllUsers(100, 0),
          getAllCommunities(50, 0),
        ]);

        console.log(
          `[Discover] Retrieved ${users?.length || 0} users and ${
            communities?.length || 0
          } communities`
        );

        // Filter out current user from users list
        const filteredUsers = users?.filter((u) => u.id !== user.id) || [];

        setAllUsers(filteredUsers);
        setAllCommunities(communities || []);

        // Always set both initially since default tab is "all"
        setResults({
          users: filteredUsers,
          communities: communities || [],
        });
      } catch (err) {
        console.error("[Discover] Failed to load initial data:", err);
        setError("Failed to load data: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user?.id]);

  // Load user memberships
  useEffect(() => {
    const loadMemberships = async () => {
      if (!user) return;
      try {
        const memberships = await getUserCommunityMemberships(user.id);
        setUserMemberships(memberships);
      } catch (err) {
        console.error("[Discover] Failed to load user memberships:", err);
      }
    };

    loadMemberships();
  }, [user?.id]);

  // Get search query from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get("q");
    const tab = searchParams.get("tab");

    if (tab && ["all", "readers", "communities"].includes(tab)) {
      setActiveTab(tab);
    }

    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, [location.search]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      // If search is cleared, show data based on active tab
      setResults({
        users: activeTab === "communities" ? [] : allUsers,
        communities: activeTab === "readers" ? [] : allCommunities,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get search results
      const searchResults = await searchAll(searchQuery);

      // Filter results based on active tab
      setResults({
        users: activeTab === "communities" ? [] : searchResults.users || [],
        communities:
          activeTab === "readers" ? [] : searchResults.communities || [],
      });
    } catch (err) {
      console.error("[Discover] Search error:", err);
      setError("Search failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Effect to update results when tab changes
  useEffect(() => {
    if (!query.trim()) {
      setResults({
        users: activeTab === "communities" ? [] : allUsers,
        communities: activeTab === "readers" ? [] : allCommunities,
      });
    } else {
      // Retrigger search when tab changes
      handleSearch(query);
    }
  }, [activeTab]);

  const handleCreateCommunitySuccess = (newCommunity) => {
    setShowCreateModal(false);
    setAllCommunities((prev) => [newCommunity, ...prev]);
    setResults((prev) => ({
      ...prev,
      communities: [newCommunity, ...prev.communities],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find readers and communities to connect with
          </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create Community
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder={`Search for ${
                activeTab === "readers"
                  ? "readers"
                  : activeTab === "communities"
                  ? "communities"
                  : "readers or communities"
              }...`}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Tabs */}
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Results */}
        {error && (
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "all" && (
              <>
                    {results.users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
                    {results.communities.map((community) => (
                  <CommunityCard
                        key={community.id}
                    community={community}
                    userMemberships={userMemberships}
                  />
                ))}
              </>
            )}
            {activeTab === "readers" &&
              results.users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            {activeTab === "communities" &&
              results.communities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  userMemberships={userMemberships}
                />
              ))}
          </div>
        )}
      </div>

      {/* Community Creation Modal */}
      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateCommunitySuccess}
      />
    </div>
  );
}
