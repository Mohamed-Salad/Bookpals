import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCommunities, getUserCommunities, joinCommunity, createCommunity } from '../../lib/database';

export default function Communities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    genre: [],
    readingType: ''
  });

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const [allCommunities, userComms] = await Promise.all([
        getCommunities(),
        getUserCommunities(user.id)
      ]);
      setCommunities(allCommunities);
      setUserCommunities(userComms);
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await joinCommunity(communityId, user.id);
      loadCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      await createCommunity(newCommunity);
      setShowCreateForm(false);
      setNewCommunity({
        name: '',
        description: '',
        genre: [],
        readingType: ''
      });
      loadCommunities();
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Clubs</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create Book Club
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Book Club</h2>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reading Type</label>
                <select
                  value={newCommunity.readingType}
                  onChange={(e) => setNewCommunity({ ...newCommunity, readingType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                >
                  <option value="">Select a reading type</option>
                  <option value="casual">Casual</option>
                  <option value="serious">Serious</option>
                  <option value="academic">Academic</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <div key={community.id} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{community.name}</h3>
              <p className="text-gray-600 mb-4">{community.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {community.genre?.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {community.member_count || 0} members
                </span>
                {!userCommunities.some((c) => c.id === community.id) && (
                  <button
                    onClick={() => handleJoinCommunity(community.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 