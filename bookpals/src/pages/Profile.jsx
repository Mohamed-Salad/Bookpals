import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
} from "../services/database";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);

  // Memoize the loadProfile function
  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [profileData, preferencesData] = await Promise.all([
        getProfile(user.id),
        getPreferences(user.id),
      ]);
      setProfile(profileData);
      setPreferences(preferencesData);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load profile data only when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdatePreferences = async (formData) => {
    try {
      setError(null);
      const [updatedProfile, updatedPreferences] = await Promise.all([
        updateProfile(user.id, {
          username: formData.username,
          updated_at: new Date().toISOString(),
        }),
        updatePreferences(user.id, {
          reading_type: formData.reading_type,
          reading_frequency: formData.reading_frequency,
          preferred_reading_time: formData.preferred_reading_time,
          preferred_reading_format: formData.preferred_reading_format,
          favorite_genres: formData.favorite_genres,
          favorite_authors: formData.favorite_authors,
          reading_goals: formData.reading_goals,
        }),
      ]);

      // Update local state with returned data instead of re-fetching
      setProfile(updatedProfile);
      setPreferences(updatedPreferences);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <PreferencesForm
        initialValues={preferences}
        onSubmit={handleUpdatePreferences}
        submitButtonText="Update Preferences"
      />
    </div>
  );
}
