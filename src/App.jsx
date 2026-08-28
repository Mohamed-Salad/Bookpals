import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { createContext, useState, useContext, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Interests from "./components/onboarding/Interests";
import Communities from "./components/community/Communities";
import CommunityView from "./components/community/CommunityView";
import CreateGroupChat from "./components/socials/CreateGroupChat";
import AuthCallback from "./context/AuthCallBack";
import Search from "./components/Search";
import Discover from "./pages/Discover";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext";
import ChatPage from "./pages/ChatRooms";
import Conversation from "./components/chat/Conversation";

// Create NotificationContext
export const NotificationContext = createContext();

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// App content component
const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Left Sidebar state

  const isHomePage = location.pathname === "/home";
  const isLandingPage = location.pathname === "/";
  const isChatPage = location.pathname.startsWith("/chat");

  const isCommunityPage = location.pathname.startsWith("/community/"); // More specific check

  // Toggle for Left Sidebar
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Determine if sidebars should be shown
  const showSidebar = user && (isHomePage || isCommunityPage) && !isChatPage;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {!isChatPage && <Navbar />}

      <div className="relative flex pt-14">
        {/* Left Sidebar container */}
        {showSidebar && (
          <div
            className={`fixed inset-y-0 left-0 z-30 pt-14 transition-all duration-300 ease-in-out ${
              isSidebarExpanded ? "w-72" : "w-20"
            } hidden md:block`}
          >
            <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
          </div>
        )}

        {/* Main Content Area - Revert to ONLY left margin adjustment */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            showSidebar ? (isSidebarExpanded ? "md:ml-72" : "md:ml-20") : "ml-0"
          }`}
        >
          <main className="p-4 md:p-6">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/interests"
                element={
                  <ProtectedRoute>
                    <Interests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities"
                element={
                  <ProtectedRoute>
                    <Communities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    <Discover />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              >
                <Route path=":channelId" element={<Conversation />} />
              </Route>
              <Route
                path="/create-group"
                element={
                  <ProtectedRoute>
                    <CreateGroupChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community/:communityId"
                element={
                  <ProtectedRoute>
                    <CommunityView />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <Router>
              <AppContent />
            </Router>
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
