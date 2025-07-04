import React, { useCallback, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotification } from "../../context/NotificationContext";
import { signOut } from "../../services/auth";

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

  // Protected routes that should show sign out button
  const authPages = [
    "/home",
    "/profile",
    "/interests",
    "/communities",
    "/reader-categorization",
    "/search",
  ];

  // Helper function to determine which auth button to show
  const renderAuthButton = () => {
    if (loading) {
      return (
        <div className="animate-pulse w-20 h-8 bg-gray-200 rounded-md"></div>
      );
    }

    // Only show sign out button when user is authenticated AND on protected pages
    if (user && authPages.includes(location.pathname)) {
      return (
        <button
          onClick={handleSignOut}
          className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign Out
        </button>
      );
    }

    // If on login page, show Sign Up button
    if (location.pathname === "/login") {
      return (
        <Link
          to="/signup"
          className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign Up
        </Link>
      );
    }

    // If on signup page, show Sign In button
    if (location.pathname === "/signup") {
      return (
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign In
        </Link>
      );
    }

    // For all other non-authenticated pages, show both Sign In & Sign Up
    if (!user) {
      return (
        <div className="flex space-x-3">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center px-4 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign Up
          </Link>
        </div>
      );
    }

    return null;
  };

  // Nav links for authenticated users
  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/profile", label: "Profile" },
    { to: "/interests", label: "Interests" },
    { to: "/discover", label: "Discover" },
    { to: "/communities", label: "Communities" },
  ];

  return (
    <nav
      className={`z-40 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 left-0`}
    >
      <div className="mx-auto px-4 lg:px-6">
        <div className="flex justify-between h-14">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={user ? "/home" : "/"}
                className="text-lg font-bold text-primary"
              >
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
                    className={`border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center px-1 border-b-2 text-sm font-medium ${
                      location.pathname === link.to
                        ? "border-primary text-primary dark:text-primary-light"
                        : ""
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
                className="md:hidden p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
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
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
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
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={toggleMobileNotifications}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-72 max-w-md">
              <div className="h-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-medium">Notifications</h2>
                  <button
                    onClick={toggleMobileNotifications}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Friend Requests ({friendRequests.length})
                        </h3>
                        {friendRequests.slice(0, 2).map((request) => (
                          <div
                            key={request.id}
                            className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 mb-2"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-2">
                                {request.profiles.avatar_url ? (
                                  <img
                                    src={request.profiles.avatar_url}
                                    alt={request.profiles.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                                    {request.profiles.username
                                      ?.charAt(0)
                                      .toUpperCase() || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {request.profiles.username || "User"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unread messages section */}
                    {unreadMessages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Unread Messages ({unreadMessages.length})
                        </h3>
                        {unreadMessages.slice(0, 2).map((message) => (
                          <div
                            key={message.id}
                            className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 mb-2"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-2">
                                {message.image ? (
                                  <img
                                    src={message.image}
                                    alt={message.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                                    {message.name?.charAt(0).toUpperCase() ||
                                      "?"}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {message.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {message.lastMessage}
                                </p>
                              </div>
                              <span className="ml-2 bg-primary text-white text-xs px-1.5 rounded-full">
                                {message.unreadCount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {friendRequests.length === 0 &&
                      unreadMessages.length === 0 && (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 mx-auto mb-2 text-gray-400"
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
                    className="mt-4 w-full block text-center p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
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
