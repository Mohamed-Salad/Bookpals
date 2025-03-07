import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, Stack, CircularProgress, Alert } from '@mui/material';
import { supabase } from '../config/supabaseConfig';
import { auth } from '../config/firebase';

interface UserProfileData {
  username: string;
  bio: string;
  reading_preferences: string[];
  favorite_books: string[];
}

interface UserProfileProps {
  userId: string;
  isEditable?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, isEditable = false }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfileData>>({});

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setProfile(data as UserProfileData);
        } else {
          // Create a default profile if it doesn't exist
          const defaultProfile: UserProfileData = {
            username: auth.currentUser?.displayName || 'Anonymous Reader',
            bio: '',
            reading_preferences: [],
            favorite_books: []
          };

          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([{ user_id: userId, ...defaultProfile }]);

          if (insertError) throw insertError;
          setProfile(defaultProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Handle profile updates
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(editedProfile)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Fetch updated profile
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data as UserProfileData);
      setIsEditing(false);
      setEditedProfile({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box p={3}>
        <Alert severity="info">Profile not found</Alert>
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            {profile.username}'s Profile
          </Typography>
          {isEditable && (
            <Button
              variant={isEditing ? 'contained' : 'outlined'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </Box>

        {isEditing ? (
          <Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleUpdate(); }}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={editedProfile.username || profile.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                fullWidth
              />
              <TextField
                label="Bio"
                multiline
                rows={4}
                value={editedProfile.bio || profile.bio}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                Save Changes
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body1" color="text.secondary">
              {profile.bio || 'No bio yet'}
            </Typography>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Reading Preferences
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {profile.reading_preferences.map((pref, index) => (
                  <Chip key={index} label={pref} />
                ))}
                {profile.reading_preferences.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No preferences set
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Favorite Books
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {profile.favorite_books.map((book, index) => (
                  <Chip key={index} label={book} />
                ))}
                {profile.favorite_books.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No favorite books added
                  </Typography>
                )}
              </Box>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}; 