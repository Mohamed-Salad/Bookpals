// src/pages/Search.jsx
import React, { useState } from "react";
import { searchAll } from "../services/searchService";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], communities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.trim()) {
      handleSearch({ preventDefault: () => {} });
    }
  }, []);
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searchAll(query);
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for readers or communities..."
            className="flex-1 px-4 py-2 bg-dark-lighter/50 border border-primary/20 rounded-l-lg text-white"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg"
          >
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8">Searching...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {/* Users section */}
          {results.users.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Readers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}

          {/* Communities section */}
          {results.communities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Communities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.communities.map((community) => (
                  <div
                    key={community.id}
                    className="bg-dark-light/50 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-medium">{community.name}</h3>
                    {community.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {results.users.length === 0 &&
            results.communities.length === 0 &&
            query && (
              <div className="text-center py-8 text-gray-400">
                No results found for "{query}"
              </div>
            )}
        </div>
      )}
    </div>
  );
}
