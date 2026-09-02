import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getCommentsByDiscussionId,
  createComment,
} from "../../services/database";
import { Skeleton } from "../ui/Skeleton";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedComments = await getCommentsByDiscussionId(postId, 5);
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setPostingComment(true);
    try {
      const created = await createComment(postId, newComment);
      if (created) {
        setComments((prev) => [created, ...prev]);
        setNewComment("");
      } else {
        throw new Error("Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {user && (
        <form onSubmit={handleCommentSubmit} className="flex items-start gap-2">
          <Avatar
            src={user.user_metadata?.avatar_url}
            name={user.user_metadata?.username}
            size="sm"
            className="shrink-0"
          />
          <textarea
            rows="1"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-grow px-3 py-1.5 bg-surface border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ink text-sm resize-none"
            disabled={postingComment}
          />
          <Button type="submit" disabled={postingComment || !newComment.trim()} className="text-xs px-3 py-1.5">
            {postingComment ? "…" : "Post"}
          </Button>
        </form>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      )}

      {error && <p className="text-red-500 text-center text-sm">{error}</p>}

      {!loading && !error && comments.length === 0 && (
        <p className="text-ink-muted text-center text-sm py-2">No comments yet.</p>
      )}
      {!loading && !error && comments.length > 0 && (
        <div className="space-y-3 pt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="text-xs p-2 bg-surface-raised rounded-lg text-ink">
              <span className="font-semibold">{comment.profiles?.username || "User"}:</span>{" "}
              {comment.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
