import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideIn, listItem } from '../../utils/animations';

// Mock data for community features
const MOCK_POSTS = [
  {
    id: 1,
    author: 'John',
    title: 'Book Recommendation: The Midnight Library',
    content: 'Just finished this amazing book! The concept of parallel lives was fascinating...',
    likes: 24,
    comments: 8,
    timestamp: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc'
  },
  {
    id: 2,
    author: 'Sarah',
    title: 'Discussion: Favorite Fantasy Series',
    content: 'What are your favorite fantasy series? I\'m looking for something new to read...',
    likes: 18,
    comments: 12,
    timestamp: '4 hours ago',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'
  }
];

const MOCK_MEMBERS = [
  { id: 1, name: 'John', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc' },
  { id: 2, name: 'Sarah', role: 'Moderator', avatar: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c' },
  { id: 3, name: 'Mike', role: 'Member', avatar: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f' },
];

const Community = ({ communityId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const handleCreatePost = (e) => {
    e.preventDefault();
    // Handle post creation logic here
    setNewPost({ title: '', content: '' });
  };

  return (
    <div className="flex flex-col h-full bg-dark-light/50 backdrop-blur-sm">
      {/* Community Header */}
      <div className="p-4 border-b border-dark-lighter/30">
        <h2 className="text-xl font-bold text-white">Fantasy Readers</h2>
        <p className="text-gray-400 text-sm">1,234 members • 56 online</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 p-4 border-b border-dark-lighter/30">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'posts'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'members'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Events
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Create Post Form */}
              <form onSubmit={handleCreatePost} className="bg-dark-lighter/50 rounded-lg p-4">
                <input
                  type="text"
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-2 mb-4 bg-dark-lighter/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-2 mb-4 bg-dark-lighter/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary h-32"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                >
                  Create Post
                </button>
              </form>

              {/* Posts List */}
              <motion.div variants={listItem} initial="initial" animate="animate">
                {MOCK_POSTS.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={listItem}
                    className="bg-dark-lighter/50 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={post.image}
                        alt={post.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-white font-medium">{post.author}</h3>
                        <p className="text-gray-400 text-sm">{post.timestamp}</p>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{post.title}</h4>
                    <p className="text-gray-300 mb-4">{post.content}</p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-white">
                        <span>❤️</span>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-white">
                        <span>💬</span>
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {MOCK_MEMBERS.map((member) => (
                <motion.div
                  key={member.id}
                  variants={listItem}
                  className="bg-dark-lighter/50 rounded-lg p-4 flex items-center space-x-3"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-white font-medium">{member.name}</h3>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center text-gray-400"
            >
              <p>No upcoming events</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Community; 