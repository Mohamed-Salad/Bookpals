import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createCommunity,
  updateCommunityBanner,
} from "../../services/database";
import { Dialog } from "@headlessui/react";
import { GENRES } from "../../utils/questions";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export default function CreateCommunityModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    genre: [],
    rules: "",
    is_private: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "genre") {
      setFormData((prev) => {
        const currentGenres = prev.genre || [];
        if (checked) {
          return { ...prev, genre: [...currentGenres, value] };
        } else {
          return { ...prev, genre: currentGenres.filter((g) => g !== value) };
        }
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.genre || formData.genre.length === 0) {
      setError("Please select at least one genre.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const communityData = {
        ...formData,
        created_by: user.id,
        created_at: new Date().toISOString(),
      };

      const newCommunity = await createCommunity(communityData);

      if (selectedFile) {
        await updateCommunityBanner(newCommunity.id, selectedFile);
      }

      onSuccess?.(newCommunity);
      onClose();
    } catch (err) {
      if (
        err.message &&
        err.message.includes(
          'duplicate key value violates unique constraint "communities_name_key"'
        )
      ) {
        setError("A community with this name already exists.");
      } else if (
        err.message &&
        err.message.includes("malformed array literal") &&
        err.message.includes("rules")
      ) {
        setError(
          "Database error: Community Rules field might be incorrectly configured as an array. It should be text."
        );
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
      console.error("Community creation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-surface p-6 w-full shadow-xl my-8">
          <Dialog.Title className="font-display text-xl font-semibold text-ink mb-4">
            Create New Community
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Community Name *"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter community name"
            />

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What is this community about?"
                rows={3}
                className="w-full px-3 py-2 border border-ink/15 rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Select Genres * (Choose at least one)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 max-h-48 overflow-y-auto p-2 border border-ink/15 rounded-lg">
                {GENRES.map((genre) => (
                  <label
                    key={genre}
                    className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="genre"
                      value={genre}
                      checked={formData.genre.includes(genre)}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-ink/30 text-accent-dark focus:ring-accent"
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
              {error && error.includes("Please select at least one genre.") && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Community Rules
              </label>
              <textarea
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                placeholder="Optional: Set guidelines for your community (e.g., Be respectful, No spoilers)"
                rows={3}
                className="w-full px-3 py-2 border border-ink/15 rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-ink-muted mt-1">
                Enter rules as plain text. Formatting will be applied on the
                community page.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Community Banner (Optional)
              </label>
              <div className="mt-1 flex items-center">
                <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-ink/15 rounded-lg hover:bg-surface-raised text-sm text-ink-muted">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/gif"
                    className="hidden"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-ink-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {selectedFile ? "Change Banner" : "Upload Banner"}
                </label>
                {selectedFile && (
                  <span className="ml-3 text-sm text-ink-muted truncate max-w-[150px]">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}{" "}
                    KB)
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-1">
                Recommended format: JPG, PNG, GIF. Max size: 2MB.
              </p>
            </div>

            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                name="is_private"
                id="is_private"
                checked={formData.is_private}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-ink/30 text-accent-dark focus:ring-accent"
              />
              <label htmlFor="is_private" className="ml-2 block text-sm text-ink">
                Make this a Private Community (members must be approved)
              </label>
            </div>

            {error && !error.includes("Please select at least one genre.") && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg mt-4">
                Error: {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating…" : "Create Community"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
