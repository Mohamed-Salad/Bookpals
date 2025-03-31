import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const QUESTIONS = [
  {
    id: 'reading_frequency',
    question: 'How often do you read?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'occasionally', label: 'Occasionally' }
    ]
  },
  {
    id: 'reading_environment',
    question: 'Where do you prefer to read?',
    options: [
      { value: 'home', label: 'At home' },
      { value: 'library', label: 'Library' },
      { value: 'cafe', label: 'Café' },
      { value: 'anywhere', label: 'Anywhere' }
    ]
  },
  {
    id: 'reading_format',
    question: 'What format do you prefer?',
    options: [
      { value: 'physical', label: 'Physical books' },
      { value: 'ebook', label: 'E-books' },
      { value: 'audiobook', label: 'Audiobooks' },
      { value: 'all', label: 'All formats' }
    ]
  },
  {
    id: 'reading_time',
    question: 'When do you prefer to read?',
    options: [
      { value: 'morning', label: 'Morning' },
      { value: 'afternoon', label: 'Afternoon' },
      { value: 'evening', label: 'Evening' },
      { value: 'night', label: 'Night' }
    ]
  },
  {
    id: 'reading_style',
    question: 'How do you approach reading?',
    options: [
      { value: 'casual', label: 'Casual reader' },
      { value: 'analytical', label: 'Analytical reader' },
      { value: 'escapist', label: 'Escapist reader' },
      { value: 'educational', label: 'Educational reader' }
    ]
  }
];

export default function ReaderCategorization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== QUESTIONS.length) {
      setError('Please answer all questions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('reader_preferences')
        .upsert({
          user_id: user.id,
          preferences: answers,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Navigate to home page after successful save
      navigate('/home');
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentStep + 1} of {QUESTIONS.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {currentStep === QUESTIONS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(answers).length !== QUESTIONS.length}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id] || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 