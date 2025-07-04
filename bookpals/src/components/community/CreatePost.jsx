import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createPost } from "../../services/database";
import { PhotoIcon, XCircleIcon } from "@heroicons/react/24/solid";

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
    <div className="p-2 py-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700/50 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-2">
          <img
            src={
              user?.user_metadata?.avatar_url ||
              `https://ui-avatars.com/api/?name=${
                user?.user_metadata?.username?.charAt(0) || "?"
              }&background=random&color=fff`
            }
            alt={user?.user_metadata?.username || "User"}
            className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
          />
          <textarea
            rows={2}
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-focus dark:text-gray-100 text-sm resize-y min-h-[44px]"
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
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-gray-700 text-white rounded-full hover:bg-red-600 focus:outline-none"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-1.5 ml-10 pl-1 p-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs">
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
            className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light p-1 rounded-md transition-colors"
            aria-label="Upload Photo"
            title="Upload Photo"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>

          <button
            type="submit"
            className={`px-4 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium ${
              (!content.trim() && !selectedImage) || loading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={(!content.trim() && !selectedImage) || loading}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
