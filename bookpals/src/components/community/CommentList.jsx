import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  createComment,
  deleteComment,
  reactToComment,
  getCommentReplies,
} from "../../services/database";
import TimeAgo from "../../components/TimeAgo";

// Single comment component
const Comment = ({ comment, postId, isMember, level = 0 }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || {});

  // Max nesting level
  const MAX_LEVEL = 3;

  // Get user's reactions to this comment
  const userReactions = reactions[user?.id] || [];

  // Count total reactions
  const reactionCounts = {};
  Object.values(reactions).forEach((userReacts) => {
    userReacts.forEach((reaction) => {
      reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
    });
  });

  const loadReplies = async () => {
    if (level >= MAX_LEVEL) return;

    try {
      setLoading(true);
      const replyData = await getCommentReplies(comment.id);
      setReplies(replyData);
      setShowReplies(true);
    } catch (err) {
      console.error("Error loading replies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !isMember || level >= MAX_LEVEL) return;

    try {
      setLoading(true);
      const newReply = await createComment(postId, replyText, comment.id);

      if (newReply) {
        setReplies((prev) => [newReply, ...prev]);
        setReplyText("");
        setShowReplyForm(false);
        setShowReplies(true);
      }
    } catch (err) {
      console.error("Error creating reply:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reaction) => {
    if (!isMember) return;

    try {
      // Optimistic update
      const hasReaction = userReactions.includes(reaction);

      // Update local state for immediate feedback
      const updatedUserReactions = hasReaction
        ? userReactions.filter((r) => r !== reaction)
        : [...userReactions, reaction];

      setReactions((prev) => ({
        ...prev,
        [user.id]: updatedUserReactions,
      }));

      // Send to server
      await reactToComment(comment.id, reaction);
    } catch (err) {
      console.error("Error reacting to comment:", err);
      // Revert on error
      setReactions(comment.reactions || {});
    }
  };

  const handleToggleReplies = () => {
    if (showReplies) {
      setShowReplies(false);
    } else {
      if (replies.length === 0) {
        loadReplies();
      } else {
        setShowReplies(true);
      }
    }
  };

  return (
    <div className={`pl-${level > 0 ? 6 : 0} my-3`}>
      <div className="flex">
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-white text-sm">
            {comment.profiles?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800/80 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900 dark:text-white mr-2">
                {comment.profiles?.username || "Unknown User"}
              </span>
              <TimeAgo
                date={comment.created_at}
                className="text-xs text-gray-500 dark:text-gray-400"
              />
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-sm">
              {comment.content}
            </p>

            {/* Reactions */}
            {Object.keys(reactionCounts).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(reactionCounts).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`flex items-center px-1.5 py-0.5 text-xs rounded-full border ${
                      userReactions.includes(emoji)
                        ? "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40"
                        : "bg-gray-100 border-gray-200 dark:bg-gray-700/30 dark:border-gray-600/30"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span className="ml-0.5 text-xxs">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment actions */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1 space-x-3">
            {isMember && level < MAX_LEVEL && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                Reply
              </button>
            )}

            {/* Only show reaction button for non-deleted comments */}
            {isMember && !comment.is_deleted && (
              <div className="relative group">
                <button className="hover:text-gray-700 dark:hover:text-gray-300">
                  React
                </button>
                <div className="absolute left-0 bottom-full mb-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity bg-white dark:bg-gray-700 rounded-lg shadow-lg p-1 z-10 flex gap-0.5">
                  {["👍", "❤️", "😂"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="text-sm hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show toggle replies if this comment might have replies */}
            {level < MAX_LEVEL && (
              <button
                onClick={handleToggleReplies}
                className={`flex items-center hover:text-gray-700 dark:hover:text-gray-300 ${
                  loading ? "opacity-50" : ""
                }`}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : `${showReplies ? "Hide" : "Show"} ${
                      replies.length ? replies.length : ""
                    } replies`}
              </button>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <form onSubmit={handleReply} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || loading}
                    className="px-3 py-1 text-sm bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {loading ? "..." : "Reply"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          <AnimatePresence>
            {showReplies && replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2"
              >
                {replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    isMember={isMember}
                    level={level + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Main comment list component
const CommentList = ({ comments, loading, postId, isMember }) => {
  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          postId={postId}
          isMember={isMember}
        />
      ))}
    </div>
  );
};

export default CommentList;
