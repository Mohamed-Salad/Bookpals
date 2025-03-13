import React, { useState } from 'react';
import './Interests.css';

const Interests = () => {
  const [selected, setSelected] = useState([]);

  const interestsList = [
    'Art', 'Biography', 'Business', 'Chick Lit', 'Children’s',
    'Christian', 'Classics', 'Ebooks', 'Comics', 'Fantasy',
     'Graphic Novels', 'Historical Fiction', 'Horror', 'Humor and Comedy',
    'Manga', 'Mystery', 'Music', 'Nonfiction', 'Paranormal',
    'Philosophy', 'Poetry', 'Psychology', 'Romance', 'Science',
    'Science Fiction', 'Self-Help', 'Sports', 'Suspense', 'Thriller',
    'Travel', 'Young Adult'
  ];

  const toggleInterest = (interest) => {
    setSelected((prevSelected) =>
      prevSelected.includes(interest)
        ? prevSelected.filter((item) => item !== interest)
        : [...prevSelected, interest]
    );
  };

  const handleSubmit = () => {
    // Handle saving or sending the selected interests
    console.log('Selected interests:', selected);
    // e.g., navigate to the next page or show an alert
  };

  return (
    <div className="interests-container">
      <h2 className="interests-heading">Next, select your favorite genres.</h2>
      
      <div className="highlight-box">
        <p>
          We use your favorite genres to make better book recommendations and tailor
          what you see in your feed.
        </p>
      </div>

      <div className="interests-grid">
        {interestsList.map((interest) => (
          <label
            key={interest}
            className={`interest-option ${
              selected.includes(interest) ? 'selected' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(interest)}
              onChange={() => toggleInterest(interest)}
            />
            {interest}
          </label>
        ))}
      </div>

      <div className="missing-genre">
        <a href="#!">Don’t see your favorite genre?</a>
      </div>

      <button
        className="continue-button"
        onClick={handleSubmit}
        disabled={selected.length === 0}
      >
        {selected.length === 0
          ? 'Select at least one genre to continue'
          : 'Continue'}
      </button>
    </div>
  );
};

export default Interests;
