import React, { useState, useEffect } from 'react';
import './Home.css';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { auth, database } from './Supabase';

const Home = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Get current user
        const { user } = await auth.getCurrentUser();
        
        if (user) {
          // Get user profile
          const { data: profile } = await database.getProfile(user.id);
          
          if (profile) {
            // TODO: Use your recommendation algorithm here
            // For now, showing dummy data
            setRecommendations([
              {
                id: 1,
                type: 'community',
                name: 'Fantasy Book Club',
                description: 'A community for fantasy book lovers',
                image: 'https://picsum.photos/200/300?random=1',
                members: 1200
              },
              {
                id: 2,
                type: 'user',
                name: 'Jane Smith',
                description: 'Loves mystery and thriller novels',
                image: 'https://picsum.photos/200/300?random=2',
                booksRead: 156
              },
              // Add more dummy recommendations
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="home-page">
      <Navbar />
      
      <main className="main-content">
        <div className="search-section">
          <h1>Find Your Reading Community</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for readers, communities, or book genres..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        <section className="recommendations-section">
          <h2>Recommended for you</h2>
          {loading ? (
            <div className="loading">Loading recommendations...</div>
          ) : recommendations.length > 0 ? (
            <div className="recommendations-grid">
              {recommendations.map((item) => (
                <div key={item.id} className="recommendation-card">
                  <img src={item.image} alt={item.name} className="card-image" />
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="card-stats">
                      {item.type === 'community' ? (
                        <span>{item.members} members</span>
                      ) : (
                        <span>{item.booksRead} books read</span>
                      )}
                    </div>
                    <button className="connect-button">
                      {item.type === 'community' ? 'Join' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-recommendations">
              <p>No recommendations available. Try updating your reading preferences.</p>
              <Link to="/interests" className="update-preferences-button">
                Update Preferences
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
