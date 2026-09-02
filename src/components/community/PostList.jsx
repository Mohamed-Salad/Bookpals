import PostItem from "./PostItem";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";

// Simplified PostList to be a presentational component
const PostList = ({ posts, isLoading, error, isMember, onJoinCommunity }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description={
          isMember
            ? "Make a post to get the discussion going!"
            : "Join the community to view and make posts."
        }
        action={
          !isMember && onJoinCommunity ? (
            <Button onClick={onJoinCommunity}>Join Community</Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </motion.div>
  );
};

export default PostList;
