/**
 * User Profile Page
 * Displays user information, reading preferences, and activity
 */

import React from 'react';
import { Container, Typography, Box, Paper, Avatar } from '@mui/material';

interface UserProfileProps {
  userId: string;
  isEditable?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, isEditable = false }) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar 
              sx={{ width: 120, height: 120 }}
              alt="User Profile"
            />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                User Profile
              </Typography>
              <Typography color="textSecondary">
                Member since {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          {/* TODO: Add reading preferences and book list */}
          {isEditable && (
            <Typography color="textSecondary" sx={{ mt: 2 }}>
              You can edit this profile
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 