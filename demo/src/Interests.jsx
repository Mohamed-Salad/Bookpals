import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Interests.css';
import { auth, database } from './Supabase';
import Navbar from './Navbar';

const Interests = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [readingType, setReadingType] = useState('');
  const [readingFrequency, setReadingFrequency] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [readingFormat, setReadingFormat] = useState('');
  const [favoriteAuthors, setFavoriteAuthors] = useState('');
  const [readingGoals, setReadingGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: user, error } = await auth.getCurrentUser();
        if (error || !user) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      }
    };
    checkAuth();
  }, []);

  const validateUsername = (username) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    const validationError = validateUsername(newUsername);
    setUsernameError(validationError);
  };

  const genresList = [
    'Art', 'Biography', 'Business', 'Chick Lit', "Children's",
    'Christian', 'Classics', 'Ebooks', 'Comics', 'Fantasy',
    'Graphic Novels', 'Historical Fiction', 'Horror', 'Humor and Comedy',
    'Manga', 'Mystery', 'Music', 'Nonfiction', 'Paranormal',
    'Philosophy', 'Poetry', 'Psychology', 'Romance', 'Science',
    'Science Fiction', 'Self-Help', 'Sports', 'Suspense', 'Thriller',
    'Travel', 'Young Adult'
  ];

  const readingTypes = [
    'Academia', 'Traditional Books', 'Online Novels',
    'Traditional Comics', 'Online Comics'
  ];

  const frequencies = [
    'Daily', 'Weekly', 'Occasionally', 'Rarely'
  ];

  const readingTimes = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const readingFormats = ['Hardcover', 'Paperback', 'E-reader', 'Audiobook'];

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((item) => item !== genre)
        : [...prev, genre]
    );
  };

  const toggleReadingType = (type) => {
    setReadingType(readingType === type ? '' : type);
  };

  const toggleFrequency = (freq) => {
    setReadingFrequency(readingFrequency === freq ? '' : freq);
  };

  const handleSubmit = async () => {
    if (!username || !readingType || !readingFrequency || selectedGenres.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { user, error: userError } = await auth.getCurrentUser();
      if (userError) throw userError;

      // Check if username is already taken
      const { data: existingUser, error: checkError } = await database.checkUsername(username);
      if (checkError) throw checkError;
      if (existingUser?.length > 0) {
        setUsernameError('Username is already taken');
        setLoading(false);
        return;
      }

      // Save profile data
      const { error: profileError } = await database.upsertProfile(user.id, {
        username,
        reading_type: readingType,
        interests: selectedGenres
      });

      if (profileError) throw profileError;

      // Save preferences data
      const { error: preferencesError } = await database.upsertPreferences(user.id, {
        reading_time: readingTime,
        reading_format: readingFormat,
        favorite_authors: favoriteAuthors.split(',').map(author => author.trim()).filter(Boolean),
        reading_goals: readingGoals
      });

      if (preferencesError) throw preferencesError;

      // After saving preferences, go back to home
      navigate('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(error.message || 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="interests-container">
        <h2 className="interests-heading">Complete Your Profile</h2>
        
        <div className="highlight-box">
          <p>
            We'll use this information to connect you with readers who share your interests
            and reading style.
          </p>
        </div>

        <div className="form-group">
          <h3>Choose your username</h3>
          <input
            type="text"
            className="username-input"
            placeholder="Enter username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
          {usernameError && <div className="error-message">{usernameError}</div>}
          <p className="input-hint">Username can contain letters, numbers, underscores, and hyphens</p>
        </div>

        <h3>What type of reading do you prefer?</h3>
        <div className="interests-grid">
          {readingTypes.map((type) => (
            <label
              key={type}
              className={`interest-option ${readingType === type ? 'selected' : ''}`}
              onClick={() => toggleReadingType(type)}
            >
              {type}
            </label>
          ))}
        </div>

        <h3>How often do you read?</h3>
        <div className="interests-grid">
          {frequencies.map((freq) => (
            <label
              key={freq}
              className={`interest-option ${readingFrequency === freq ? 'selected' : ''}`}
              onClick={() => toggleFrequency(freq)}
            >
              {freq}
            </label>
          ))}
        </div>

        <h3>When do you prefer to read?</h3>
        <div className="interests-grid">
          {readingTimes.map((time) => (
            <label
              key={time}
              className={`interest-option ${readingTime === time ? 'selected' : ''}`}
              onClick={() => setReadingTime(time)}
            >
              {time}
            </label>
          ))}
        </div>

        <h3>What's your preferred reading format?</h3>
        <div className="interests-grid">
          {readingFormats.map((format) => (
            <label
              key={format}
              className={`interest-option ${readingFormat === format ? 'selected' : ''}`}
              onClick={() => setReadingFormat(format)}
            >
              {format}
            </label>
          ))}
        </div>

        <h3>Who are your favorite authors?</h3>
        <div className="form-group">
          <input
            type="text"
            className="current-reading-input"
            placeholder="Enter favorite authors (comma-separated)"
            value={favoriteAuthors}
            onChange={(e) => setFavoriteAuthors(e.target.value)}
          />
        </div>

        <h3>What are your reading goals?</h3>
        <div className="form-group">
          <input
            type="text"
            className="current-reading-input"
            placeholder="e.g., Read 12 books this year, Explore new genres"
            value={readingGoals}
            onChange={(e) => setReadingGoals(e.target.value)}
          />
        </div>

        <h3>What are your favorite genres?</h3>
        <div className="interests-grid">
          {genresList.map((genre) => (
            <label
              key={genre}
              className={`interest-option ${selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </label>
          ))}
        </div>

        <div className="form-group">
          <h3>What are you currently reading?</h3>
          <input
            type="text"
            className="current-reading-input"
            placeholder="Enter book name (optional)"
            value={currentReading}
            onChange={(e) => setCurrentReading(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="continue-button"
          onClick={handleSubmit}
          disabled={loading || !username || !readingType || !readingFrequency || selectedGenres.length === 0}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Interests;
