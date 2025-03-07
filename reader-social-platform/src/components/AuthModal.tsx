import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  Typography, 
  TextField,
  InputAdornment,
  styled
} from '@mui/material';
import { Button } from './Button';
import { Mail, Lock, User, Chrome } from 'lucide-react';

// Styled TextField component with floating label effect
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--discord-channel)',
    color: 'var(--discord-text)',
    '& fieldset': {
      borderColor: 'var(--discord-channel)',
    },
    '&:hover fieldset': {
      borderColor: 'var(--discord-gold)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--discord-gold)',
    },
    '& input': {
      paddingLeft: '40px',
    }
  },
  '& .MuiInputLabel-root': {
    color: 'var(--discord-muted)',
    '&.Mui-focused': {
      color: 'var(--discord-gold)',
    }
  },
}));

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string, password: string, username?: string) => void;
  mode: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onSuccess, mode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSuccess(formData.email, formData.password, mode === 'signup' ? formData.username : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: 'var(--discord-dark)',
          color: 'var(--discord-text)',
          minWidth: '400px',
          borderRadius: '12px',
          '& .MuiDialogContent-root': {
            padding: '2rem'
          }
        }
      }}
    >
      <DialogContent>
        <Typography variant="h4" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
          {mode === 'login' ? 'Sign In' : 'Register'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Box sx={{ 
              bgcolor: 'error.main', 
              color: 'error.contrastText', 
              p: 2, 
              borderRadius: 1, 
              mb: 2,
              textAlign: 'center',
              opacity: 0.9
            }}>
              {error}
            </Box>
          )}

          {mode === 'signup' && (
            <StyledTextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 1 }}>
                    <User size={20} className="text-discord-muted" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <StyledTextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <Mail size={20} className="text-discord-muted" />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <Lock size={20} className="text-discord-muted" />
                </InputAdornment>
              ),
            }}
          />

          {mode === 'login' && (
            <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
              <Typography 
                component="button"
                type="button"
                sx={{ 
                  color: 'var(--discord-gold)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => {/* TODO: Implement password recovery */}}
              >
                Recover Password
              </Typography>
            </Box>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full mb-4"
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            my: 3,
            '&::before, &::after': {
              content: '""',
              flex: 1,
              borderBottom: '1px solid var(--discord-channel)'
            }
          }}>
            <Typography variant="body2" sx={{ color: 'var(--discord-muted)' }}>
              or
            </Typography>
          </Box>

          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2"
          >
            <Chrome className="text-xl" />
            Continue with Google
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography sx={{ color: 'var(--discord-muted)', mb: 1 }}>
              {mode === 'login' ? "Don't have an account yet?" : "Already have an account?"}
            </Typography>
            <Typography
              component="button"
              type="button"
              sx={{ 
                color: 'var(--discord-gold)',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              onClick={() => {
                setFormData({ email: '', password: '', username: '' });
                onClose();
              }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 