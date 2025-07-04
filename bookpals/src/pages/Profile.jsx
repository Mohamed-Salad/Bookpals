// In src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideIn } from "../utils/animations";
import {
  updateProfile,
  updateProfilePicture,
  getProfile,
} from "../services/database";
const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar_url: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id) {
          const profileData = await getProfile(user.id);
          setFormData({
            username: profileData?.username || "",
            bio: profileData?.bio || "",
            avatar_url: profileData?.avatar_url || "",
          });
          const isComplete = !!(profileData?.bio && profileData?.avatar_url);
          setProfileComplete(isComplete);
          setShowTutorial(!isComplete);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user]);
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadingImage(true);
        const updatedProfile = await updateProfilePicture(user.id, file);
        setFormData((prev) => ({
          ...prev,
          avatar_url: updatedProfile.avatar_url,
        }));
        setUploadingImage(false);
        if (!profileComplete) {
          setProfileComplete(!!formData.bio);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setUploadingImage(false);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await updateProfile(user.id, formData);
      setIsEditing(false);
      if (!profileComplete && formData.bio && formData.avatar_url) {
        setProfileComplete(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setFormLoading(false);
    }
  };
  const dismissTutorial = () => {
    setShowTutorial(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-slate-900 dark:to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          My Profile
        </h1>
        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Complete Your Profile
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Welcome to BookPals! Let's make your profile stand out to
                  connect with fellow book lovers:
                </p>
                <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Upload a profile picture</li>
                  <li>Write a short bio about your reading preferences</li>
                  <li>Describe your favorite books or genres</li>
                </ul>
                <div className="flex justify-end">
                  <button
                    onClick={dismissTutorial}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-primary to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative group w-32 h-32">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt={`${formData.username || "User"}'s avatar`}
                    className="w-full h-full rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Upload Photo
                  </div>
                )}

                <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
            </div>{" "}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Your username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Tell us about yourself and your reading preferences..."
                    rows="4"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Share your favorite genres, authors, or what you're
                    currently reading.
                  </p>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.username || "Your Name"}
                </h2>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    About Me
                  </h3>
                  {formData.bio ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {formData.bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No bio yet. Click "Edit Profile" to add information about
                      yourself.
                    </p>
                  )}
                </div>
                {!profileComplete && (
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Complete Your Profile
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                      {!formData.avatar_url && !formData.bio
                        ? "Add a profile picture and bio to help others connect with you."
                        : !formData.avatar_url
                        ? "Add a profile picture to complete your profile."
                        : "Add a bio to tell others about your reading interests."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
