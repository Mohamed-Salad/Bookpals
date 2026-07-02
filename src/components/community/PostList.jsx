import React from "react";
import PostItem from "./PostItem";
import { motion } from "framer-motion";

// Simplified PostList to be a presentational component
const PostList = ({ posts, isLoading, error, isMember, onJoinCommunity }) => {
  // Handle loading state passed from parent
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error state passed from parent
  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        <p>{error}</p>
        {/* Optionally add a retry button that calls a function passed from parent */}
      </div>
    );
  }

  // Handle empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Posts Yet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {isMember
            ? "Make a post to stimulate the community!"
            : "Join the community to view and make posts."}
        </p>
        {!isMember && onJoinCommunity && (
          <button
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            onClick={onJoinCommunity}
          >
            Join Community
          </button>
        )}
        {/* Link Create Post button to the trigger/modal in CommunityView */}
        {/* This button might be removed if the CreatePostTrigger is always visible */}
        {isMember && (
          <p className="text-sm text-gray-500">
            Use the create post button above to share something.
          </p>
        )}
      </div>
    );
  }

  // Render the list of posts
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {posts.map((post) => (
          <PostItem key={post.id} post={post} /> // Removed unnecessary props like isMember
        ))}
      </motion.div>
      {/* Removed infinite scroll logic/loader - parent handles loading */}
    </div>
  );
};

export default PostList;
