// Reading types and options
export const READING_TYPES = [
  "Academia",
  "Traditional Books",
  "Online Novels",
  "Traditional Comics",
  "Online Comics",
];

export const GENRES = [
  "Art",
  "Biography",
  "Business",
  "Chick Lit",
  "Children's",
  "Christian",
  "Classics",
  "Ebooks",
  "Comics",
  "Fantasy",
  "Graphic Novels",
  "Historical Fiction",
  "Horror",
  "Humor and Comedy",
  "Manga",
  "Mystery",
  "Music",
  "Nonfiction",
  "Paranormal",
  "Philosophy",
  "Poetry",
  "Psychology",
  "Romance",
  "Science",
  "Science Fiction",
  "Self-Help",
  "Sports",
  "Suspense",
  "Thriller",
  "Travel",
  "Young Adult",
];

export const FREQUENCIES = ["Daily", "Weekly", "Occasionally", "Rarely"];

export const READING_TIMES = ["Morning", "Afternoon", "Evening", "Night"];
export const READING_FORMATS = [
  "Hardcover",
  "Paperback",
  "E-reader",
  "Audiobook",
];

// Validation functions
export const validateUsername = (username) => {
  if (!username) return "Username is required";
  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }
  return null;
};

// Reader Categorization Questions
export const CATEGORIZATION_QUESTIONS = [
  {
    id: "reading_frequency",
    question: "How often do you read?",
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "occasionally", label: "Occasionally" },
    ],
  },
  {
    id: "reading_environment",
    question: "Where do you prefer to read?",
    options: [
      { value: "home", label: "At home" },
      { value: "library", label: "Library" },
      { value: "cafe", label: "Café" },
      { value: "anywhere", label: "Anywhere" },
    ],
  },
  {
    id: "reading_format",
    question: "What format do you prefer?",
    options: [
      { value: "physical", label: "Physical books" },
      { value: "ebook", label: "E-books" },
      { value: "audiobook", label: "Audiobooks" },
      { value: "all", label: "All formats" },
    ],
  },
  {
    id: "reading_time",
    question: "When do you prefer to read?",
    options: [
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" },
      { value: "night", label: "Night" },
    ],
  },
  {
    id: "reading_style",
    question: "How do you approach reading?",
    options: [
      { value: "casual", label: "Casual reader" },
      { value: "analytical", label: "Analytical reader" },
      { value: "escapist", label: "Escapist reader" },
      { value: "educational", label: "Educational reader" },
    ],
  },
];

// Mock data for development
export const MOCK_DATA = {
  communities: [
    {
      id: 1,
      name: "Fantasy Readers",
      members: 1234,
      image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc",
    },
    {
      id: 2,
      name: "Sci-Fi Enthusiasts",
      members: 856,
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
    },
    {
      id: 3,
      name: "Book Club",
      members: 432,
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    },
  ],
  chats: [
    {
      id: 1,
      name: "General Discussion",
      lastMessage: "Anyone reading anything good?",
      time: "2m ago",
    },
    {
      id: 2,
      name: "Book Recommendations",
      lastMessage: "Check out this new release!",
      time: "1h ago",
    },
    {
      id: 3,
      name: "Reading Group",
      lastMessage: "Next meeting on Friday",
      time: "3h ago",
    },
  ],
};

// Questions array for the interests form
export const READING_QUESTIONS = [
  {
    id: "username",
    type: "text",
    label: "Choose your username",
    placeholder: "Enter your username",
    description: "This will be your unique identifier in the community",
    validation: validateUsername,
  },
  {
    id: "readingType",
    type: "single-select",
    label: "What type of reading do you prefer?",
    options: READING_TYPES,
    required: true,
  },
  {
    id: "readingFrequency",
    type: "single-select",
    label: "How often do you read?",
    options: FREQUENCIES,
    required: true,
  },
  {
    id: "readingTime",
    type: "single-select",
    label: "When do you prefer to read?",
    options: READING_TIMES,
    required: false,
  },
  {
    id: "readingFormat",
    type: "single-select",
    label: "What's your preferred reading format?",
    options: READING_FORMATS,
    required: false,
  },
  {
    id: "genres",
    type: "multi-select",
    label: "Select your favorite genres",
    options: GENRES,
    required: true,
  },
  {
    id: "favoriteAuthors",
    type: "text",
    label: "Who are your favorite authors?",
    placeholder: "Enter favorite authors (comma-separated)",
    required: false,
  },
  {
    id: "readingGoals",
    type: "text",
    label: "What are your reading goals?",
    placeholder: "e.g., Read 24 books this year, Explore new genres",
    required: false,
  },
];

export const formatUserPreferences = (formData) => {
  const requiredFields = [
    "username",
    "reading_type",
    "reading_frequency",
    "genres",
  ];
  const missingFields = requiredFields.filter((field) => !formData[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return {
    username: formData.username,
    reading_type: formData.readingType,
    reading_frequency: formData.readingFrequency,
    reading_time: formData.readingTime || null,
    reading_format: formData.readingFormat || null,
    genres: formData.genres,
    favorite_authors: formData.favoriteAuthors || null,
    reading_goals: formData.readingGoals || null,
  };
};
