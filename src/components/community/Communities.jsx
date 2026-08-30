import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCommunityDiscussions } from "../../services/database";
import PostItem from "./PostItem";
import ErrorBoundary from "../../components/ErrorBoundary";
import { Link } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";

const Communities = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const postsData = await getCommunityDiscussions(user.id);
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading posts:", error);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Community Posts</h1>
          <Link
            to="/discover?tab=communities"
            className="text-accent-dark hover:underline transition-colors"
          >
            Find Communities
          </Link>
        </div>

        <ErrorBoundary>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4 mt-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-8">
              {posts.length === 0 ? (
                <EmptyState
                  title="No posts yet"
                  description="Join a community to start discussing!"
                />
              ) : (
                posts.map((post) => (
                  <ErrorBoundary key={post.id}>
                    <PostItem post={post} />
                  </ErrorBoundary>
                ))
              )}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Communities;
