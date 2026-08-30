import { useEffect, useState } from "react";
import { getCreators, CRAFTS } from "../services/creatorService";
import { GENRES } from "../utils/questions";
import { CreatorCard } from "../components/creators/CreatorCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../components/ui/cn";

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [craft, setCraft] = useState(null);
  const [genre, setGenre] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCreators({ craft, genre: genre || undefined })
      .then((data) => !cancelled && setCreators(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [craft, genre]);

  return (
    <div className="min-h-screen bg-paper py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Creators</h1>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCraft(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border",
                craft === null
                  ? "bg-accent-dark text-white border-accent-dark"
                  : "bg-surface text-ink border-ink/15 hover:bg-surface-raised"
              )}
            >
              All crafts
            </button>
            {CRAFTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCraft(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border capitalize",
                  craft === c
                    ? "bg-accent-dark text-white border-accent-dark"
                    : "bg-surface text-ink border-ink/15 hover:bg-surface-raised"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm border border-ink/15 bg-surface text-ink"
          >
            <option value="">All genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400">Couldn't load creators: {error}</p>
        ) : !creators.length ? (
          <EmptyState
            title="No creators found"
            description="Try a different craft or genre filter."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {creators.map((c) => (
              <CreatorCard key={c.user_id} creator={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
