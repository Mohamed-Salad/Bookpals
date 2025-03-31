import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideIn, listItem } from '../../utils/animations';
import Chat from './Chat';
import Community from './Community';

// Questions from demo
const READING_TYPES = [
  'Academia', 'Traditional Books', 'Online Novels',
  'Traditional Comics', 'Online Comics'
];

const FREQUENCIES = [
  'Daily', 'Weekly', 'Occasionally', 'Rarely'
];

const READING_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'];
const READING_FORMATS = ['Hardcover', 'Paperback', 'E-reader', 'Audiobook'];

const GENRES = [
  'Art', 'Biography', 'Business', 'Chick Lit', "Children's",
  'Christian', 'Classics', 'Ebooks', 'Comics', 'Fantasy',
  'Graphic Novels', 'Historical Fiction', 'Horror', 'Humor and Comedy',
  'Manga', 'Mystery', 'Music', 'Nonfiction', 'Paranormal',
  'Philosophy', 'Poetry', 'Psychology', 'Romance', 'Science',
  'Science Fiction', 'Self-Help', 'Sports', 'Suspense', 'Thriller',
  'Travel', 'Young Adult'
];

// Mock data for communities and chats
const MOCK_COMMUNITIES = [
  { id: 1, name: 'Fantasy Readers', members: 1234, image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc' },
  { id: 2, name: 'Sci-Fi Enthusiasts', members: 856, image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c' },
  { id: 3, name: 'Book Club', members: 432, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f' },
];

const MOCK_CHATS = [
  { id: 1, name: 'General Discussion', lastMessage: 'Anyone reading anything good?', time: '2m ago' },
  { id: 2, name: 'Book Recommendations', lastMessage: 'Check out this new release!', time: '1h ago' },
  { id: 3, name: 'Reading Group', lastMessage: 'Next meeting on Friday', time: '3h ago' },
];

export default function Home() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('communities');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-dark-light/50 backdrop-blur-sm p-4 border-r border-dark-lighter/30"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">BookPals</h2>
            <p className="text-gray-400 text-sm">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab('communities')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'communities'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Communities
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'chats'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Chats
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'communities' ? (
                <motion.div
                  key="communities"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4"
                >
                  {MOCK_COMMUNITIES.map(community => (
                    <motion.div
                      key={community.id}
                      variants={listItem}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={() => setSelectedCommunity(community.id)}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-lighter/50 transition-colors"
                      >
                        <img
                          src={community.image}
                          alt={community.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-white font-medium">{community.name}</h3>
                          <p className="text-gray-400 text-sm">{community.members} members</p>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="chats"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4"
                >
                  {MOCK_CHATS.map(chat => (
                    <motion.div
                      key={chat.id}
                      variants={listItem}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={() => setSelectedChat(chat.id)}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-lighter/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {chat.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{chat.name}</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                            <span className="text-gray-500 text-xs">{chat.time}</span>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <Chat chatId={selectedChat} />
          ) : selectedCommunity ? (
            <Community communityId={selectedCommunity} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8"
            >
              {/* Logo */}
              <div className="mb-12 text-center">
                <h1 className="text-6xl font-bold text-white mb-4">BookPals</h1>
                <p className="text-xl text-gray-400">Connect with readers who share your interests</p>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-3xl mb-12">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for books, communities, or discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-lg border border-white/10"
                  />
                  <button className="absolute right-6 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors">
                    Search
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-4">
                <button className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors">
                  Browse Books
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors border border-white/10">
                  Join Community
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 