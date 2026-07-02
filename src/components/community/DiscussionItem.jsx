import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { createDiscussion } from "../../services/database";
import { useAuth } from "../../context/AuthContext";

/**
 * A unified component that can serve two purposes:
 * 1. Display an existing discussion post (when post prop is provided)
 * 2. Create a new discussion post (when createMode=true)
 *
 * @param {Object} props - Component props
 * @param {Object} props.post - Discussion post data (for display mode)
 * @param {boolean} props.createMode - Whether component is in create mode
 * @param {string} props.communityId - Community ID for creating new posts
 * @param {Function} props.onDiscussionCreated - Callback after post creation
 */
const DiscussionItem = ({
  post,
  createMode = false,
  communityId,
  onDiscussionCreated,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle submitting a new discussion
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createDiscussion(communityId, user.id, content);
      setContent("");
      onDiscussionCreated?.();
    } catch (error) {
      console.error("Error creating discussion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create mode - render form for new post
  if (createMode) {
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-dark-light/50 backdrop-blur-sm p-4 rounded-lg border border-primary/20 mb-6"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start a discussion..."
          className="w-full bg-dark-darker p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
          rows="3"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    );
  }

  // Display mode - render an existing post
  if (!post) return null;

  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  return (
    <div className="bg-dark-light/50 backdrop-blur-sm p-4 rounded-lg border border-primary/20 mb-4">
      <div className="flex items-start">
        <img
          src={post.profiles.avatar_url || "/default-avatar.png"}
          alt={post.profiles.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-semibold text-white">
              {post.profiles.username}
            </h3>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
          <p className="mt-2 text-gray-300">{post.content}</p>
        </div>
      </div>
    </div>
  );
};

export default DiscussionItem;
