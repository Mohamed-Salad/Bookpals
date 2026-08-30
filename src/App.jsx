import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { createContext, lazy, Suspense, useState, useContext, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import AuthCallback from "./context/AuthCallBack";
import { NotificationProvider } from "./context/NotificationContext";
import { Skeleton } from "./components/ui/Skeleton";

// Route-level code splitting - each page ships as its own chunk instead of
// one large bundle, so a first visit only downloads the page it lands on.
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Home = lazy(() => import("./pages/Home"));
const Matches = lazy(() => import("./pages/Matches"));
const Profile = lazy(() => import("./pages/Profile"));
const Interests = lazy(() => import("./components/onboarding/Interests"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Creators = lazy(() => import("./pages/Creators"));
const Communities = lazy(() => import("./components/community/Communities"));
const CommunityView = lazy(() => import("./components/community/CommunityView"));
const CreateGroupChat = lazy(() => import("./components/socials/CreateGroupChat"));
const Search = lazy(() => import("./components/Search"));
const Discover = lazy(() => import("./pages/Discover"));
const ChatPage = lazy(() => import("./pages/ChatRooms"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-paper p-8">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

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
  const isMatchesPage = location.pathname.startsWith("/matches");
  const isCreatorsPage = location.pathname.startsWith("/creators");

  // Toggle for Left Sidebar
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Determine if sidebars should be shown
  const showSidebar =
    user &&
    (isHomePage || isCommunityPage || isMatchesPage || isCreatorsPage) &&
    !isChatPage;

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
            <Suspense fallback={<RouteFallback />}>
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
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creators"
                element={
                  <ProtectedRoute>
                    <Creators />
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
                path="/matches"
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:channelId?"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
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
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
