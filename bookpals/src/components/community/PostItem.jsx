import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import TimeAgo from "../TimeAgo";
import {
  HandThumbUpIcon as HandThumbUpIconOutline,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpIconSolid } from "@heroicons/react/24/solid";
import { reactToDiscussion } from "../../services/database";
import { toast } from "react-toastify";
import CommentSection from "./CommentSection";

const PostItem = ({ post, isMember }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const author = post?.profiles;

  // State for Likes
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Initialize like state from post reactions
  useEffect(() => {
    if (post.reactions && user?.id) {
      const reactionsData = post.reactions; // reactions is JSONB: { userId: [reactionType,...], ... }
      let count = 0;
      let userLiked = false;
      // Iterate over users who reacted
      for (const userId in reactionsData) {
        if (
          Array.isArray(reactionsData[userId]) &&
          reactionsData[userId].includes("like")
        ) {
          count++;
          if (userId === user.id) {
            userLiked = true;
          }
        }
      }
      setCurrentLikeCount(count);
      setIsLikedByCurrentUser(userLiked);
    } else {
      // Calculate initial count if reactions exist but user is not logged in
      let count = 0;
      if (post.reactions) {
        for (const userId in post.reactions) {
          if (
            Array.isArray(post.reactions[userId]) &&
            post.reactions[userId].includes("like")
          ) {
            count++;
          }
        }
      }
      setCurrentLikeCount(count);
      setIsLikedByCurrentUser(false);
    }
  }, [post.reactions, user?.id]);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Handle Like Button Click
  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts.");
      return;
    }
    if (likeLoading) return; // Prevent double clicks

    setLikeLoading(true);
    const currentlyLiked = isLikedByCurrentUser;

    // Optimistic UI update
    setIsLikedByCurrentUser(!currentlyLiked);
    setCurrentLikeCount((prev) => (currentlyLiked ? prev - 1 : prev + 1));

    try {
      const success = await reactToDiscussion(post.id, "like"); // Toggle like reaction
      if (!success) {
        throw new Error("Server failed to process like.");
      }
      // Success: UI already updated optimistically
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to update like. Please try again.");
      // Revert optimistic update on error
      setIsLikedByCurrentUser(currentlyLiked);
      setCurrentLikeCount((prev) => (currentlyLiked ? prev + 1 : prev - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  if (!author) {
    // Handle cases where author profile might be missing unexpectedly
    // This shouldn't happen with the current DB select, but good practice
    // console.warn("Post missing author profile:", post);
    // return null; // Or render a placeholder
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700/30 mb-4"
    >
      {/* Post Header */}
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author?.username || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-lg font-medium">
                {(author?.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {author?.username || "Unknown User"}
          </p>
          <TimeAgo
            date={post.created_at}
            className="text-sm text-gray-500 dark:text-gray-400"
          />
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Post Image - Conditionally render */}
      {post.image_url && (
        <a
          href={post.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 h-64 rounded-md border dark:border-gray-700 bg-black/5 dark:bg-black/10 overflow-hidden cursor-pointer group relative"
        >
          <img
            src={post.image_url}
            alt="Post image - Click to view larger"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5"
              />
            </svg>
          </div>
        </a>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-start space-x-6 border-t border-gray-200 dark:border-gray-700/50 pt-2 mt-2">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center space-x-1 hover:text-primary dark:hover:text-primary-light transition-colors text-sm ${
            isLikedByCurrentUser
              ? "text-primary dark:text-primary-light font-medium"
              : "text-gray-500 dark:text-gray-400"
          } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLikedByCurrentUser ? (
            <HandThumbUpIconSolid className="w-5 h-5" />
          ) : (
            <HandThumbUpIconOutline className="w-5 h-5" />
          )}
          <span>Like</span>
          {/* Show count if > 0 */}
          {currentLikeCount > 0 && (
            <span className="text-xs ml-1">({currentLikeCount})</span>
          )}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors text-sm"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
          <span>Comment</span>
          {/* TODO: Add comment count later */}
        </button>
        {/* Add Share button later if needed */}
      </div>

      {/* Comment Section - Conditionally render */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
          {/* Replace placeholder with actual component */}
          <CommentSection postId={post.id} />
        </div>
      )}
    </motion.div>
  );
};

export default PostItem;
