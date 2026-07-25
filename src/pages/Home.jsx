import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useChat } from "../context/ChatContext";
import Community from "../components/community/Communities";
import ChatPage from "../pages/ChatRooms";
import RecommendedUsers from "../components/recommendations/RecommendedUsers";
import RecommendedCommunities from "../components/recommendations/RecommendedCommunities";
import { Button } from "../components/ui/Button";

export default function Home() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { startChat } = useChat();

  useEffect(() => {
    if (location.state?.openChat) {
      setSelectedChat(location.state.openChat);
      setSelectedCommunity(null);
    }
  }, [location.state]);

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    setSelectedCommunity(null);
    navigate(`/chat/${chatId}`);
  };

  const handleSelectCommunity = (communityId) => {
    setSelectedCommunity(communityId);
    setSelectedChat(null);
    navigate(`/communities/${communityId}`);
  };

  return (
    <div className="min-h-screen flex flex-col mt-16">
      {/* Main content layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-paper">
          {selectedChat ? (
            <ChatPage chatId={selectedChat} />
          ) : selectedCommunity ? (
            <Community communityId={selectedCommunity} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col p-8"
            >
              {/* Header */}
              <div className="mb-12 text-center">
                <h1 className="font-display text-4xl font-bold text-ink mb-4">
                  Welcome to BookPals
                </h1>
                <p className="text-xl text-ink-muted">
                  Connect with readers who share your interests
                </p>
              </div>

              {/* Recommendations Section */}
              <div className="mb-12 max-w-4xl mx-auto w-full">
                <h2 className="font-display text-2xl font-bold text-ink mb-6">
                  Recommended Readers
                </h2>
                <RecommendedUsers limit={6} />
              </div>

              {/* Added Recommended Communities Section */}
              <div className="mb-12 max-w-4xl mx-auto w-full">
                <h2 className="font-display text-2xl font-bold text-ink mb-6">
                  Suggested Communities
                </h2>
                <RecommendedCommunities limit={3} />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button onClick={() => navigate("/discover")} className="shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Discover More Readers
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => navigate("/discover?tab=communities")}
                  className="shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Join Communities
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => navigate("/chat")}
                  className="shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View Messages
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
