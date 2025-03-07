import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { auth } from '../config/firebase';
import { updateProfile } from 'firebase/auth';
import { supabase } from '../config/supabaseConfig';
import { BookOpen, User, BookMarked, Heart } from 'lucide-react';
import { Container, Typography, Box } from '@mui/material';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    favoriteGenres: [] as string[],
    favoriteAuthors: [] as string[],
    readingGoals: [] as string[],
  });

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy',
    'Romance', 'Thriller', 'Horror', 'Biography', 'Poetry',
    'Historical Fiction', 'Literary Fiction', 'Young Adult', 'Children',
    'Self-Help', 'Philosophy', 'Science', 'Technology', 'Art',
    'Travel', 'Food', 'Sports', 'Business', 'Education'
  ];

  const goals = [
    'Read more books this year',
    'Explore new genres',
    'Join book clubs',
    'Share reviews',
    'Connect with authors',
    'Build a personal library',
    'Improve reading speed',
    'Learn new perspectives'
  ];

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      readingGoals: prev.readingGoals.includes(goal)
        ? prev.readingGoals.filter(g => g !== goal)
        : [...prev.readingGoals, goal]
    }));
  };

  const handleNext = async () => {
    if (step === 1 && !formData.displayName.trim()) {
      alert('Please enter your display name');
      return;
    }

    if (step === 2 && formData.favoriteGenres.length === 0) {
      alert('Please select at least one genre');
      return;
    }

    if (step === 3 && formData.readingGoals.length === 0) {
      alert('Please select at least one reading goal');
      return;
    }

    if (step === 3) {
      try {
        const user = auth.currentUser;
        if (user) {
          // Update Firebase Auth profile
          await updateProfile(user, {
            displayName: formData.displayName
          });

          // Save user preferences to Supabase
          const { error } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.uid,
              username: formData.displayName,
              bio: '',
              reading_preferences: formData.favoriteGenres,
              favorite_books: [],
              reading_goals: formData.readingGoals,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (error) throw error;
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tell us about your reading preferences
        </Typography>
        <div className="min-h-screen bg-discord-bg flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-discord-dark rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-center mb-8">
              <BookOpen className="h-8 w-8 text-discord-gold mr-2" />
              <h1 className="text-2xl font-serif font-bold text-discord-text">Welcome to Literati Connect</h1>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-discord-muted">Step {step} of 3</span>
                <span className="text-sm text-discord-muted">{Math.round((step / 3) * 100)}%</span>
              </div>
              <div className="h-2 bg-discord-darker rounded-full">
                <div
                  className="h-full bg-discord-gold rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: Display Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-discord-text mb-4">
                  <User className="h-5 w-5" />
                  <h2 className="text-xl font-serif font-semibold">Choose Your Display Name</h2>
                </div>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your display name"
                  className="w-full px-4 py-2 bg-discord-darker border border-discord-channel rounded-lg text-discord-text focus:outline-none focus:border-discord-gold"
                />
              </div>
            )}

            {/* Step 2: Favorite Genres */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-discord-text mb-4">
                  <BookMarked className="h-5 w-5" />
                  <h2 className="text-xl font-serif font-semibold">Select Your Favorite Genres</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        formData.favoriteGenres.includes(genre)
                          ? 'bg-discord-gold text-discord-dark'
                          : 'bg-discord-darker text-discord-text hover:bg-discord-channel'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Reading Goals */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-discord-text mb-4">
                  <Heart className="h-5 w-5" />
                  <h2 className="text-xl font-serif font-semibold">Set Your Reading Goals</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {goals.map(goal => (
                    <button
                      key={goal}
                      onClick={() => handleGoalToggle(goal)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        formData.readingGoals.includes(goal)
                          ? 'bg-discord-gold text-discord-dark'
                          : 'bg-discord-darker text-discord-text hover:bg-discord-channel'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button onClick={handleNext} className="ml-auto">
                {step === 3 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </Box>
    </Container>
  );
}; 