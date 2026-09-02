import { useState, useEffect } from "react";
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
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import CommentSection from "./CommentSection";

const PostItem = ({ post }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const author = post?.profiles;

  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Initialize like state from post reactions
  useEffect(() => {
    const reactionsData = post.reactions || {};
    let count = 0;
    let userLiked = false;
    for (const userId in reactionsData) {
      if (
        Array.isArray(reactionsData[userId]) &&
        reactionsData[userId].includes("like")
      ) {
        count++;
        if (user?.id && userId === user.id) userLiked = true;
      }
    }
    setCurrentLikeCount(count);
    setIsLikedByCurrentUser(userLiked);
  }, [post.reactions, user?.id]);

  const toggleComments = () => setShowComments((prev) => !prev);

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts.");
      return;
    }
    if (likeLoading) return;

    setLikeLoading(true);
    const currentlyLiked = isLikedByCurrentUser;

    // Optimistic UI update
    setIsLikedByCurrentUser(!currentlyLiked);
    setCurrentLikeCount((prev) => (currentlyLiked ? prev - 1 : prev + 1));

    try {
      const success = await reactToDiscussion(post.id, "like");
      if (!success) throw new Error("Server failed to process like.");
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to update like. Please try again.");
      setIsLikedByCurrentUser(currentlyLiked);
      setCurrentLikeCount((prev) => (currentlyLiked ? prev + 1 : prev - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  if (!author) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-4 md:p-6 mb-4">
        {/* Post Header */}
        <div className="flex items-start mb-4">
          <Avatar
            src={author.avatar_url}
            name={author.username}
            size="md"
            className="mr-3 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink truncate">
              {author.username || "Unknown User"}
            </p>
            <TimeAgo date={post.created_at} className="text-sm text-ink-muted" />
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-ink whitespace-pre-line">{post.content}</p>
        </div>

        {/* Post Image */}
        {post.image_url && (
          <a
            href={post.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-3 h-64 rounded-lg border border-ink/10 bg-ink/5 overflow-hidden cursor-pointer group relative"
          >
            <img
              src={post.image_url}
              alt="Post image - click to view larger"
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
        <div className="flex items-center gap-6 border-t border-ink/10 pt-2 mt-2">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1 transition-colors text-sm ${
              isLikedByCurrentUser
                ? "text-accent-dark font-medium"
                : "text-ink-muted hover:text-accent-dark"
            } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLikedByCurrentUser ? (
              <HandThumbUpIconSolid className="w-5 h-5" />
            ) : (
              <HandThumbUpIconOutline className="w-5 h-5" />
            )}
            <span>Like</span>
            {currentLikeCount > 0 && (
              <span className="text-xs ml-1">({currentLikeCount})</span>
            )}
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center gap-1 text-ink-muted hover:text-accent-dark transition-colors text-sm"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
            <span>Comment</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-3 pt-3 border-t border-ink/10">
            <CommentSection postId={post.id} />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PostItem;
