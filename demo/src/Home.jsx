import React from 'react';
import './Home.css';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <section className="hero-container">
        <div className="hero-text">
          <h1>
            Want to find your reading pal or communities with your book interests?
          </h1>
          <p>
            Whether you're a casual reader or a bookworm, connect with people who share your
            passion for reading.
          </p>
          <Link to="/signup">
            <button className="signup-button">Sign up</button>
          </Link>
        </div>
        <div className="hero-image">
          <img src="p4.jpg" alt="Passion fruit on a table" />
        </div>
      </section>

      <section className="content-section">
        <h2>Discover Your Reading Community</h2>
        <p>Connect with fellow book lovers based on your interests and reading style.</p>
        <div className="cards-container">
          <div className="card">
            <img src="p1.png" alt="Group silhouette" />
            <h3>Find your tribe</h3>
            <p>Join book clubs that match your reading interests.</p>
          </div>
          <div className="card">
            <img src="p2.png" alt="Dog with a book" />
            <h3>Find your match</h3>
            <p>Match with readers who love the same genre as you.</p>
          </div>
          <div className="card">
            <img src="p3.png" alt="Scrabble letters spelling 'Who are you?'" />
            <h3>Who are you?</h3>
            <p>Discover your reading personality and connect with like-minded people.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-left">BookPals</div>
        <div className="footer-right">
          <ul>
            <li>More</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Home;
