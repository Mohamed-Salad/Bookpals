import { useCallback, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotification } from "../../context/NotificationContext";
import { signOut } from "../../services/auth";
import { Button, buttonVariants } from "../ui/Button";
import { Avatar } from "../ui/Avatar";

const Navbar = () => {
  // Get authentication state and loading status from AuthContext
  const { user, loading } = useAuth();
  // For programmatic navigation
  const navigate = useNavigate();
  // To determine current route/page
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  // Get notification state from context
  const {
    notificationCount,
    showMobileNotifications,
    toggleMobileNotifications,
    friendRequests,
    unreadMessages,
  } = useNotification();

  // Handle user sign out - use useCallback for performance
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [navigate]);

  // Helper function to determine which auth button to show
  const renderAuthButton = () => {
    if (loading) {
      return <div className="animate-pulse w-20 h-8 bg-surface-raised rounded-md" />;
    }

    // Logged in: always show Sign Out, regardless of which page (every
    // authenticated route needs this, not just a hardcoded allowlist -
    // that allowlist previously left /matches, /creators, /discover,
    // /chat, /onboarding, and /community/:id with no button at all).
    if (user) {
      return (
        <Button onClick={handleSignOut} className="px-4 py-1.5 text-sm">
          Sign Out
        </Button>
      );
    }

    if (location.pathname === "/login") {
      return (
        <Link to="/signup" className={buttonVariants("primary", "px-4 py-1.5 text-sm")}>
          Sign Up
        </Link>
      );
    }

    if (location.pathname === "/signup") {
      return (
        <Link to="/login" className={buttonVariants("primary", "px-4 py-1.5 text-sm")}>
          Sign In
        </Link>
      );
    }

    return (
      <div className="flex gap-3">
        <Link to="/login" className={buttonVariants("primary", "px-4 py-1.5 text-sm")}>
          Sign In
        </Link>
        <Link to="/signup" className={buttonVariants("secondary", "px-4 py-1.5 text-sm")}>
          Sign Up
        </Link>
      </div>
    );
  };

  // Nav links for authenticated users - kept in sync with Sidebar's NAV_ITEMS
  // (this is the small-screen fallback; Sidebar itself is hidden below md:)
  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/discover", label: "Discover" },
    { to: "/communities", label: "Communities" },
    { to: "/matches", label: "Matches" },
    { to: "/creators", label: "Creators" },
    { to: "/chat", label: "Chat" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <nav className="z-40 bg-surface border-b border-ink/10 fixed w-full top-0 left-0">
      <div className="mx-auto px-4 lg:px-6">
        <div className="flex justify-between h-14">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={user ? "/home" : "/"} className="font-display text-lg font-bold text-accent-dark">
                BookPals
              </Link>
            </div>

            {/* Only show navigation links when user is authenticated and not loading */}
            {!loading && user && (
              <div className="hidden sm:ml-4 sm:flex sm:space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`border-transparent text-ink-muted hover:border-ink/20 hover:text-ink inline-flex items-center px-1 border-b-2 text-sm font-medium ${
                      location.pathname === link.to ? "border-accent text-accent-dark" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Authentication Buttons & Icons */}
          <div className="flex items-center space-x-3">
            {/* Notification button - only show for authenticated users */}
            {!loading && user && (
              <button
                onClick={toggleMobileNotifications}
                className="md:hidden p-2 rounded-full text-ink-muted hover:bg-surface-raised focus:outline-none relative"
                aria-label="Toggle notifications"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-ink-muted hover:bg-surface-raised focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {renderAuthButton()}
          </div>
        </div>
      </div>

      {/* Mobile notification sidebar */}
      {showMobileNotifications && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={toggleMobileNotifications}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-72 max-w-md">
              <div className="h-full bg-surface shadow-xl overflow-y-auto">
                <div className="p-4 border-b border-ink/10 flex justify-between items-center">
                  <h2 className="font-display text-lg font-medium text-ink">Notifications</h2>
                  <button
                    onClick={toggleMobileNotifications}
                    className="text-ink-muted hover:text-ink"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {/* Mini version of notifications */}
                  <div className="space-y-3">
                    {/* Friend requests section */}
                    {friendRequests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-ink-muted mb-2">
                          Friend Requests ({friendRequests.length})
                        </h3>
                        {friendRequests.slice(0, 2).map((request) => (
                          <div key={request.id} className="bg-surface-raised rounded-lg p-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={request.profiles.avatar_url}
                                name={request.profiles.username}
                                size="sm"
                              />
                              <p className="font-medium text-sm text-ink">
                                {request.profiles.username || "User"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unread messages section */}
                    {unreadMessages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-ink-muted mb-2">
                          Unread Messages ({unreadMessages.length})
                        </h3>
                        {unreadMessages.slice(0, 2).map((message) => (
                          <div key={message.id} className="bg-surface-raised rounded-lg p-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar src={message.image} name={message.name} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-ink">{message.name}</p>
                                <p className="text-xs text-ink-muted truncate">
                                  {message.lastMessage}
                                </p>
                              </div>
                              <span className="ml-2 bg-accent-dark text-white text-xs px-1.5 rounded-full">
                                {message.unreadCount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {friendRequests.length === 0 && unreadMessages.length === 0 && (
                      <div className="text-center py-6 text-ink-muted">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 mx-auto mb-2 text-ink-muted"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/home"
                    className={buttonVariants("primary", "mt-4 w-full text-center")}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(Navbar);
