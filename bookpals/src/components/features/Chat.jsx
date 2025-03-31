import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideIn, listItem } from '../../utils/animations';

// Mock messages for demonstration
const MOCK_MESSAGES = [
  { id: 1, sender: 'John', content: 'Hey everyone!', timestamp: '10:00 AM' },
  { id: 2, sender: 'Sarah', content: 'Hi John! How are you?', timestamp: '10:01 AM' },
  { id: 3, sender: 'John', content: 'I\'m great! Just finished reading a fantastic book.', timestamp: '10:02 AM' },
];

const Chat = ({ chatId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: user?.email?.split('@')[0] || 'Anonymous',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-dark-light/50 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="p-4 border-b border-dark-lighter/30">
        <h2 className="text-xl font-bold text-white">General Discussion</h2>
        <p className="text-gray-400 text-sm">3 members online</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={listItem}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`flex ${message.sender === user?.email?.split('@')[0] ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === user?.email?.split('@')[0]
                    ? 'bg-primary text-white'
                    : 'bg-dark-lighter/50 text-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{message.sender}</span>
                  <span className="text-xs opacity-75">{message.timestamp}</span>
                </div>
                <p>{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-lighter/30">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-dark-lighter/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 