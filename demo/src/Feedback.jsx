import React, { useState } from 'react';
import './Feedback.css';
import Navbar from './Navbar'; 

const Feedback = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // For now, just log the values or handle them however you’d like
    console.log('Feedback received:', { name, email, message });

    // Optionally reset the form
    setName('');
    setEmail('');
    setMessage('');

    // You can show an alert, redirect, or handle success in another way
    alert('Thank you for your feedback!');
  };

  return (
    <div className="Navbar">
        <Navbar />
        <div className="Background"></div>    
    <div className="feedback-container">
      <h2>We value your feedback</h2>
      <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            placeholder="Your name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Your Message</label>
          <textarea 
            id="message" 
            rows="5" 
            placeholder="What's on your mind?" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="feedback-btn">
          Submit Feedback
        </button>
      </form>
    </div>
    </div>
  );
};

export default Feedback;
