import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getCommentsByDiscussionId,
  createComment,
} from "../../services/database";
// import CommentItem from './CommentItem'; // Import later
import { Skeleton } from "../ui/Skeleton";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedComments = await getCommentsByDiscussionId(postId, 5); // Load initial 5
      setComments(fetchedComments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle submitting a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      // Optionally show a message if not logged in or comment is empty
      return;
    }
    setPostingComment(true);
    try {
      const created = await createComment(postId, newComment);
      if (created) {
        // Add comment instantly or refetch?
        // Adding instantly for better UX
        setComments((prev) => [created, ...prev]);
        setNewComment(""); // Clear input
      } else {
        throw new Error("Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      // Show toast error?
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Comment Input Form */}
      {user && (
        <form
          onSubmit={handleCommentSubmit}
          className="flex items-start space-x-2"
        >
          <img
            src={
              user.user_metadata?.avatar_url ||
              `https://ui-avatars.com/api/?name=${
                user.user_metadata?.username?.charAt(0) || "?"
              }&background=random&color=fff`
            }
            alt="Your avatar"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <textarea
            rows="1"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-grow px-3 py-1.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-focus dark:text-gray-100 text-sm resize-none"
            disabled={postingComment}
          />
          <button
            type="submit"
            disabled={postingComment || !newComment.trim()}
            className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-xs font-medium disabled:opacity-50"
          >
            {postingComment ? "..." : "Post"}
          </button>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-4">
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      )}

      {/* Error State */}
      {error && <p className="text-red-500 text-center text-sm">{error}</p>}

      {/* Comments List */}
      {!loading && !error && comments.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm py-2">
          No comments yet.
        </p>
      )}
      {!loading && !error && comments.length > 0 && (
        <div className="space-y-3 pt-2">
          {comments.map((comment) => (
            // Replace with CommentItem later
            <div
              key={comment.id}
              className="text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
            >
              <span className="font-semibold">
                {comment.profiles?.username || "User"}:
              </span>{" "}
              {comment.content}
            </div>
            // <CommentItem key={comment.id} comment={comment} />
          ))}
          {/* TODO: Add Load More button if needed */}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
