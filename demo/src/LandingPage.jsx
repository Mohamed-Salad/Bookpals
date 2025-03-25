import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import Navbar from './Navbar';

const LandingPage = () => {
  return (
    <div className="landing-container">
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
          <div className="cta-buttons">
            <Link to="/signup">
              <button className="signup-button">Get Started</button>
            </Link>
            <Link to="/login">
              <button className="login-button">Already have an account?</button>
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/p4.jpg" alt="Reading community" />
        </div>
      </section>

      <section className="features-section">
        <h2>Discover Your Reading Community</h2>
        <p>Connect with fellow book lovers based on your interests and reading style.</p>
        <div className="cards-container">
          <div className="feature-card">
            <img src="/p1.png" alt="Community" />
            <h3>Join Communities</h3>
            <p>Find and join book clubs that match your reading interests.</p>
          </div>
          <div className="feature-card">
            <img src="/p2.png" alt="Matching" />
            <h3>Meet Reading Buddies</h3>
            <p>Connect with readers who share your favorite genres and reading habits.</p>
          </div>
          <div className="feature-card">
            <img src="/p3.png" alt="Reading Profile" />
            <h3>Track Your Journey</h3>
            <p>Build your reading profile and discover new books through recommendations.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Profile</h3>
            <p>Sign up and tell us about your reading preferences and interests.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Find Your Community</h3>
            <p>Join reading groups and connect with like-minded readers.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Sharing</h3>
            <p>Discuss books, share recommendations, and grow together.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>BookPals</h3>
            <p>Connecting readers, one page at a time.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="social-links">
              <a 
                href="https://facebook.com/readconnect" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit our Facebook page"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="https://twitter.com/readconnect" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit our Twitter page"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a 
                href="https://instagram.com/readconnect" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit our Instagram page"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 BookPals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 