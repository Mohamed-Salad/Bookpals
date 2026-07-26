import { useState, useEffect } from "react";
import { searchAll } from "../services/searchService";
import UserCard from "./UserCard";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], communities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (query.trim()) {
      handleSearch({ preventDefault: () => {} });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-display text-3xl font-bold text-ink mb-6">Search</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for readers or communities..."
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {/* Users section */}
          {results.users.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-ink mb-4">Readers</h2>
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
              <h2 className="text-xl font-semibold text-ink mb-4">Communities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.communities.map((community) => (
                  <Card key={community.id}>
                    <h3 className="text-lg font-medium text-ink">{community.name}</h3>
                    {community.description && (
                      <p className="text-sm text-ink-muted mt-1 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {results.users.length === 0 && results.communities.length === 0 && query && (
            <EmptyState title="No results found" description={`No matches for "${query}"`} />
          )}
        </div>
      )}
    </div>
  );
}
