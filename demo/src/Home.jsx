import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Navbar from './Navbar';
import { auth, database } from './Supabase';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error: authError } = await auth.getCurrentUser();
        if (authError) throw authError;

        if (user) {
          setUser(user);
          const { data: profile, error: profileError } = await database.getProfile(user.id);
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            // If profile doesn't exist, create one with default values
            if (profileError.code === 'PGRST116') {
              const { data: newProfile, error: createError } = await database.upsertProfile(user.id, {});
              if (!createError) {
                setProfile(newProfile);
              } else {
                console.error('Error creating profile:', createError);
              }
            }
          } else {
            setProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar />
      
      <main className="dashboard-content">
        <section className="welcome-section">
          <h1>Welcome Back{user?.email ? `, ${user.email}` : ''}!</h1>
          <div className="search-bar">
            <form onSubmit={handleSearch}>
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
        </section>

        <div className="dashboard-grid">
          <section className="recommendations-section">
            <h2>Recommended Reading Buddies</h2>
            <div className="recommendations-grid">
              {recommendations.length > 0 ? (
                recommendations.map((reader) => (
                  <div key={reader.id} className="reader-card">
                    <img src={reader.avatar_url || '/default-avatar.png'} alt={reader.username} />
                    <div className="reader-info">
                      <h3>{reader.username}</h3>
                      <p>{reader.reading_type}</p>
                      <div className="shared-interests">
                        {reader.interests?.slice(0, 3).map((interest, index) => (
                          <span key={index} className="interest-tag">{interest}</span>
                        ))}
                      </div>
                      <button className="connect-button">Connect</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations available. Try updating your reading preferences.</p>
                  <button onClick={() => navigate('/interests')} className="update-preferences-button">
                    Update Preferences
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="communities-section">
            <h2>Active Communities</h2>
            <div className="communities-grid">
              {communities.length > 0 ? (
                communities.map((community) => (
                  <div key={community.id} className="community-card">
                    <div className="community-header">
                      <h3>{community.name}</h3>
                      <span className="member-count">{community.member_count} members</span>
                    </div>
                    <p>{community.description}</p>
                    <div className="community-tags">
                      <span className="community-type">{community.reading_type}</span>
                      {community.genre?.map((g, index) => (
                        <span key={index} className="genre-tag">{g}</span>
                      ))}
                    </div>
                    <button className="join-button">Join Community</button>
                  </div>
                ))
              ) : (
                <div className="no-communities">
                  <p>No communities found. Why not create one?</p>
                  <button className="create-community-button">Create Community</button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
