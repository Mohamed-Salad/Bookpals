import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCommunityDiscussions } from "../../services/database";
import PostItem from "./PostItem";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useChat } from "../../context/ChatContext";
import { Link } from "react-router-dom";

const Communities = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const { isConnected } = useChat();

  const loadPosts = async () => {
      setLoading(true);
    setError(null);
    try {
      const postsData = await getCommunityDiscussions(currentUser.id);
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
          <h1 className="text-2xl font-bold">Community Posts</h1>
          <Link
            to="/discover?tab=communities"
            className="text-primary hover:text-primary-dark transition-colors"
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
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4 mt-8">
              {posts.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No posts yet. Join a community to start discussing!
              </div>
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
