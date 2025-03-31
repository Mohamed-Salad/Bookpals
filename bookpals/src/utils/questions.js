export const READING_QUESTIONS = [
  {
    id: 'username',
    type: 'text',
    label: 'Choose a username',
    placeholder: 'Enter your username',
    description: 'This will be your display name on BookPals',
    validation: (value) => {
      if (!value) return 'Username is required';
      if (value.length < 3) return 'Username must be at least 3 characters';
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, underscores, and hyphens';
      return null;
    }
  },
  {
    id: 'readingType',
    type: 'single-select',
    label: 'What type of reader are you?',
    options: [
      'Casual Reader',
      'Avid Reader',
      'Book Collector',
      'Book Club Member',
      'Professional Reader'
    ]
  },
  {
    id: 'readingFrequency',
    type: 'single-select',
    label: 'How often do you read?',
    options: [
      'Daily',
      'Weekly',
      'Monthly',
      'Occasionally',
      'Seasonally'
    ]
  },
  {
    id: 'readingTime',
    type: 'single-select',
    label: 'When do you prefer to read?',
    options: [
      'Morning',
      'Afternoon',
      'Evening',
      'Night',
      'Anytime'
    ]
  },
  {
    id: 'readingFormat',
    type: 'single-select',
    label: 'What format do you prefer?',
    options: [
      'Physical Books',
      'E-books',
      'Audiobooks',
      'Multiple Formats',
      'No Preference'
    ]
  },
  {
    id: 'genres',
    type: 'multi-select',
    label: 'Select your favorite genres',
    options: [
      'Fiction',
      'Non-Fiction',
      'Mystery',
      'Romance',
      'Science Fiction',
      'Fantasy',
      'Historical',
      'Biography',
      'Poetry',
      'Drama',
      'Horror',
      'Thriller',
      'Adventure',
      'Children',
      'Young Adult'
    ]
  },
  {
    id: 'favoriteAuthors',
    type: 'text',
    label: 'Who are your favorite authors?',
    placeholder: 'Enter authors separated by commas',
    description: 'This helps us find books you might enjoy'
  },
  {
    id: 'readingGoals',
    type: 'text',
    label: 'What are your reading goals?',
    placeholder: 'e.g., Read 50 books this year, Explore new genres',
    description: 'Share your reading aspirations with the community'
  }
];

export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, underscores, and hyphens';
  return null;
};

export const formatUserPreferences = (formData) => {
  return {
    username: formData.username,
    reading_type: formData.readingType,
    reading_frequency: formData.readingFrequency,
    reading_time: formData.readingTime,
    reading_format: formData.readingFormat,
    genres: formData.genres || [],
    favorite_authors: formData.favoriteAuthors
      ? formData.favoriteAuthors.split(',').map(author => author.trim())
      : [],
    reading_goals: formData.readingGoals
  };
}; 