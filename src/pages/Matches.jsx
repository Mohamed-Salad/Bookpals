import { useAuth } from "../context/AuthContext";
import { useMatches } from "../services/recommendationService";
import { MatchCard } from "../components/recommendations/MatchCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useSEO } from "../hooks/useSEO";

export default function Matches() {
  useSEO({
    title: "Your Matches",
    description: "Readers matched to your taste in genres, authors, and reading habits.",
  });
  const { user } = useAuth();
  const { data: matches, isLoading, error } = useMatches(user?.id, 20);

  return (
    <div className="min-h-screen bg-paper py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Your Matches</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400">
            Couldn't load matches: {error.message}
          </p>
        ) : !matches?.length ? (
          <EmptyState
            title="No matches yet"
            description="Finish your reading preferences to get matched with other readers."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {matches.map((m) => (
              <MatchCard key={m.user_id} match={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
