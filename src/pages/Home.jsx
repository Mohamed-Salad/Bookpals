import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserCommunities, getCommunityDiscussions } from "../services/database";
import PostItem from "../components/community/PostItem";
import RecommendedCommunities from "../components/recommendations/RecommendedCommunities";
import { MatchCard } from "../components/recommendations/MatchCard";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

// Visual placeholder until Phase 3 wires the real match_users RPC.
const PLACEHOLDER_MATCHES = [
  { username: "Alex Reader", score: 0.92, sharedGenres: ["Fantasy", "Sci-Fi"] },
  { username: "Jamie Books", score: 0.85, sharedGenres: ["Mystery"] },
  { username: "Sam Pages", score: 0.78, sharedGenres: ["Romance", "YA"] },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      if (!user?.id) return;
      setLoadingActivity(true);
      try {
        const communities = await getUserCommunities(user.id);
        const recentCommunities = communities.slice(0, 3);
        const discussionLists = await Promise.all(
          recentCommunities.map((c) => getCommunityDiscussions(c.id))
        );
        const merged = discussionLists
          .flat()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setActivity(merged);
      } catch (err) {
        console.error("[Home] Failed to load activity feed:", err);
      } finally {
        setLoadingActivity(false);
      }
    };
    loadActivity();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-paper py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Community activity feed */}
        <section>
          <h2 className="font-display text-2xl font-bold text-ink mb-4">
            Your Communities' Activity
          </h2>
          {loadingActivity ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : activity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Join a community to see discussions here."
              action={
                <Button onClick={() => navigate("/discover?tab=communities")}>
                  Find Communities
                </Button>
              }
            />
          ) : (
            <div>
              {activity.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Top matches rail - placeholder card + data until Phase 3 */}
        <section>
          <h2 className="font-display text-2xl font-bold text-ink mb-4">Top Matches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PLACEHOLDER_MATCHES.map((m) => (
              <MatchCard key={m.username} {...m} />
            ))}
          </div>
        </section>

        {/* Discover communities rail */}
        <section>
          <h2 className="font-display text-2xl font-bold text-ink mb-4">
            Discover Communities
          </h2>
          <RecommendedCommunities limit={3} />
        </section>
      </div>
    </div>
  );
}
