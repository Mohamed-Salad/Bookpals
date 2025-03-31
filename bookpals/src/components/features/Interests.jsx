import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { fadeIn, slideIn, listItem } from '../../utils/animations';
import { READING_QUESTIONS, validateUsername, formatUserPreferences } from '../../utils/questions';
import { supabase } from '../../lib/supabaseClient';

const Interests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (id === 'username') {
      const validationError = validateUsername(value);
      setUsernameError(validationError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['username', 'readingType', 'readingFrequency', 'genres'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError('Please fill in all required fields');
      return;
    }

    if (usernameError) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const preferences = formatUserPreferences(formData);
      
      // Save to Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: preferences.username,
          reading_preferences: preferences
        });

      if (profileError) throw profileError;

      // Save interests
      const { error: interestsError } = await supabase
        .from('user_interests')
        .upsert({
          user_id: user.id,
          genres: preferences.genres,
          reading_types: [preferences.reading_type],
          reading_frequency: preferences.reading_frequency,
          reading_time: [preferences.reading_time],
          reading_format: [preferences.reading_format]
        });

      if (interestsError) throw interestsError;

      navigate('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(error.message || 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="mb-6">
            <label className="block text-white mb-2">{question.label}</label>
            <input
              type="text"
              value={formData[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-2 bg-dark-lighter/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {question.id === 'username' && usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
            {question.description && (
              <p className="text-gray-400 text-sm mt-1">{question.description}</p>
            )}
          </div>
        );

      case 'single-select':
        return (
          <div className="mb-6">
            <label className="block text-white mb-2">{question.label}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange(question.id, option)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData[question.id] === option
                      ? 'bg-primary text-white'
                      : 'bg-dark-lighter/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'multi-select':
        return (
          <div className="mb-6">
            <label className="block text-white mb-2">{question.label}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const currentValue = formData[question.id] || [];
                    const newValue = currentValue.includes(option)
                      ? currentValue.filter(item => item !== option)
                      : [...currentValue, option];
                    handleInputChange(question.id, newValue);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (formData[question.id] || []).includes(option)
                      ? 'bg-primary text-white'
                      : 'bg-dark-lighter/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark-lighter p-8"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">Complete Your Profile</h2>
        
        <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-lg p-6 mb-8">
          <p className="text-gray-300">
            We'll use this information to connect you with readers who share your interests
            and reading style.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {READING_QUESTIONS.map((question) => (
            <motion.div
              key={question.id}
              variants={listItem}
              initial="initial"
              animate="animate"
            >
              {renderQuestion(question)}
            </motion.div>
          ))}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Interests; 