import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Interests.css';
import { auth, database } from './Supabase';
import Navbar from './Navbar';

const Interests = () => {
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [readingType, setReadingType] = useState('');
  const [readingFrequency, setReadingFrequency] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { user, error } = await auth.getCurrentUser();
      if (error || !user) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

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
    if (!readingType || !readingFrequency || selectedGenres.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { user, error: userError } = await auth.getCurrentUser();
      if (userError) throw userError;

      const { error: profileError } = await database.upsertProfile(user.id, {
        reading_type: readingType,
        reading_frequency: readingFrequency,
        current_reading: currentReading,
        interests: selectedGenres,
        updated_at: new Date()
      });

      if (profileError) throw profileError;

      // After saving preferences, go back to home
      navigate('/');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="interests-container">
        <h2 className="interests-heading">Tell us about your reading preferences</h2>
        
        <div className="highlight-box">
          <p>
            We'll use this information to connect you with readers who share your interests
            and reading style.
          </p>
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
          disabled={loading || !readingType || !readingFrequency || selectedGenres.length === 0}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Interests;
