import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import { Button } from '../components/Button';
import { AuthModal } from '../components/AuthModal';
import { signInWithGoogle } from '../services/authService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'signup' }>({
    open: false,
    mode: 'login'
  });

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithGoogle();
      if (result.user) {
        setSuccess('Successfully signed in with Google!');
        navigate('/onboarding');
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Reader Social
        </Typography>
        
        <Typography variant="h5" color="textSecondary" sx={{ maxWidth: 600, mb: 4 }}>
          Connect with readers who share your literary interests. Join our community
          to discover new books and share your thoughts.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="primary"
            onClick={() => setAuthModal({ open: true, mode: 'signup' })}
            disabled={loading}
          >
            Get Started
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAuthModal({ open: true, mode: 'login' })}
            disabled={loading}
          >
            Sign In
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button variant="secondary" onClick={handleGoogleSignIn} disabled={loading}>
            Continue with Google
          </Button>
        </Box>
      </Box>

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        mode={authModal.mode}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 