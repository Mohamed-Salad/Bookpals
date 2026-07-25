import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  searchAll,
  getAllUsers,
  getUserCommunityMemberships,
  getAllCommunities,
} from "../services/searchService";
import { useAuth } from "../context/AuthContext";
import UserCard from "../components/UserCard";
import CommunityCard from "../components/socials/CommunityCard";
import CreateCommunityModal from "../components/community/CreateCommunityModal";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

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
            <h1 className="font-display text-3xl font-bold text-ink mb-2">Discover</h1>
            <p className="text-ink-muted">Find readers and communities to connect with</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>Create Community</Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            type="text"
            aria-label="Search"
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
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="readers">Readers</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results */}
        {error && <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
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
              results.users.map((user) => <UserCard key={user.id} user={user} />)}
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
