import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  // Get authentication state and loading status from AuthContext
  const { user, loading, signOut, signIn, signUp } = useAuth();
  // For programmatic navigation
  const navigate = useNavigate();
  // To determine current route/page
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  // Debug logs
  console.log("Navbar State:", {
    user,
    loading,
    currentPath: location.pathname,
  });

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };
  const handleSignUp = async () => {
    try {
      await signUp();
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };
  // Helper function to determine which auth button to show
  const renderAuthButton = () => {
    console.log("Rendering auth button with:", {
      user,
      loading,
      path: location.pathname,
    });

    if (loading) {
      return (
        <div className="animate-pulse w-20 h-8 bg-gray-200 rounded-md"></div>
      );
    }

    // Only show sign out button when user is authenticated AND on protected pages (not login/signup)
    const authPages = [
      "/home",
      "/profile",
      "/interests",
      "/communities",
      "/reader-categorization",
    ];
    if (user && authPages.includes(location.pathname)) {
      return <button onClick={handleSignOut}>Sign Out</button>;
    }

    // If on login page, show Sign Up button
    if (location.pathname === "/login") {
      return (
        <Link
          to="/signup"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign In
        </Link>
      );
    }

    // For all other non-authenticated pages, show both Sign In & Sign Up
    if (!user) {
      return (
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign Up
          </Link>
        </div>
      );
    }

    return null;
  };

  // Main component return
  return (
    <nav className={`${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {user ? (
                <Link to="/home" className="text-xl font-bold text-primary">
                  BookPals
                </Link>
              ) : (
                <Link to="/" className="text-xl font-bold text-primary">
                  BookPals
                </Link>
              )}
            </div>
            {/* Only show navigation links when user is authenticated and not loading */}
            {!loading && user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/home"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/profile"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Profile
                </Link>
                <Link
                  to="/interests"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Interests
                </Link>
              </div>
            )}
          </div>
          {/* Authentication Buttons */}
          <div className="flex items-center">{renderAuthButton()}</div>
        </div>
      </div>
    </nav>
  );
}
