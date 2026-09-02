import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createPost } from "../../services/database";
import { PhotoIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

const CreatePost = ({ communityId, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(previewUrl);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !selectedImage) {
      setError("Please write something or upload an image to post.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData = {
        communityId: communityId,
        userId: user.id,
        content: content,
        imageFile: selectedImage,
      };

      const newPost = await createPost(postData);

      setContent("");
      clearImage();
      onPostCreated && onPostCreated(newPost);
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 bg-surface border-b border-ink/10">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-2">
          <Avatar
            src={user?.user_metadata?.avatar_url}
            name={user?.user_metadata?.username}
            size="sm"
            className="shrink-0 mt-1"
          />
          <textarea
            rows={2}
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-1.5 bg-surface-raised border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ink text-sm resize-y min-h-[44px]"
          />
        </div>

        {imagePreviewUrl && (
          <div className="mt-2 ml-10 pl-1 relative w-fit">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-h-32 rounded-md object-contain"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-ink text-white rounded-full hover:bg-red-600 focus:outline-none"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-1.5 ml-10 pl-1 p-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mt-2 ml-10 pl-1">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerFileInput}
            className="text-ink-muted hover:text-accent-dark p-1 rounded-md transition-colors"
            aria-label="Upload Photo"
            title="Upload Photo"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>

          <Button
            type="submit"
            className="text-sm px-4 py-1"
            disabled={(!content.trim() && !selectedImage) || loading}
          >
            {loading ? "Posting…" : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
