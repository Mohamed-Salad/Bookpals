import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Navbar from './Navbar';
import { auth, database } from './Supabase';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    reading_type: '',
    reading_frequency: '',
    current_reading: '',
    bio: '',
    interests: []
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user, error: authError } = await auth.getCurrentUser();
        if (authError || !user) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await database.getProfile(user.id);
        if (profileError) throw profileError;
        setProfile(profileData);
        setEditForm({
          username: profileData.username || '',
          reading_type: profileData.reading_type || '',
          reading_frequency: profileData.reading_frequency || '',
          current_reading: profileData.current_reading || '',
          bio: profileData.bio || '',
          interests: profileData.interests || []
        });

        // Fetch user connections
        const { data: connectionsData, error: connectionsError } = await database.getUserConnections(user.id);
        if (connectionsError) throw connectionsError;
        setConnections(connectionsData || []);

        // Fetch joined communities
        const { data: communitiesData, error: communitiesError } = await database.getCommunities();
        if (communitiesError) throw communitiesError;
        setCommunities(communitiesData?.filter(c => c.members?.includes(user.id)) || []);

      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await auth.getCurrentUser();
      const { error } = await database.upsertProfile(user.id, editForm);
      if (error) throw error;
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <main className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={profile?.avatar_url || '/default-avatar.png'} alt={profile?.username} />
          </div>
          <div className="profile-info">
            <h1>{profile?.username}</h1>
            <p className="reading-type">{profile?.reading_type}</p>
            <p className="reading-frequency">Reads {profile?.reading_frequency}</p>
            {!isEditing && (
              <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form className="edit-profile-form" onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Reading Type</label>
              <select
                value={editForm.reading_type}
                onChange={(e) => setEditForm({ ...editForm, reading_type: e.target.value })}
              >
                <option value="">Select reading type</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reading Frequency</label>
              <select
                value={editForm.reading_frequency}
                onChange={(e) => setEditForm({ ...editForm, reading_frequency: e.target.value })}
              >
                <option value="">Select frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currently Reading</label>
              <input
                type="text"
                value={editForm.current_reading}
                onChange={(e) => setEditForm({ ...editForm, current_reading: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">Save Changes</button>
              <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <section className="profile-details">
              <div className="current-reading">
                <h2>Currently Reading</h2>
                <p>{profile?.current_reading || 'Not specified'}</p>
              </div>
              <div className="reading-interests">
                <h2>Reading Interests</h2>
                <div className="interests-tags">
                  {profile?.interests?.map((interest, index) => (
                    <span key={index} className="interest-tag">{interest}</span>
                  ))}
                </div>
              </div>
              <div className="bio-section">
                <h2>About Me</h2>
                <p>{profile?.bio || 'No bio added yet.'}</p>
              </div>
            </section>

            <section className="connections-section">
              <h2>Reading Buddies</h2>
              <div className="connections-grid">
                {connections.length > 0 ? (
                  connections.map((connection) => (
                    <div key={connection.connected_user_id} className="connection-card">
                      <img 
                        src={connection.connected_users?.avatar_url || '/default-avatar.png'} 
                        alt={connection.connected_users?.username} 
                      />
                      <h3>{connection.connected_users?.username}</h3>
                      <p>{connection.connected_users?.reading_type}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-connections">No reading buddies yet. Start connecting!</p>
                )}
              </div>
            </section>

            <section className="communities-section">
              <h2>My Communities</h2>
              <div className="communities-grid">
                {communities.length > 0 ? (
                  communities.map((community) => (
                    <div key={community.id} className="community-card">
                      <h3>{community.name}</h3>
                      <p>{community.description}</p>
                      <div className="community-stats">
                        <span>{community.member_count} members</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-communities">Not a member of any communities yet.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile; 