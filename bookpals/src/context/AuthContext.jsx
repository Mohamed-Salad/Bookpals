import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, checkSupabaseConnection } from "../services/supabaseClient";
import authService from "../services/auth";

// Create and export the context
export const AuthContext = createContext(null);

// Named function for the hook to help with Fast Refresh
function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export the hook
export const useAuth = useAuthContext;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const handleAuthChange = async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
    };

    // Initial check
    const initAuth = async () => {
      try {
        // Check connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          setConnectionError(true);
          setLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        await handleAuthChange(null, session);
      } catch (error) {
        console.error("Initial Auth error:", error);
        setConnectionError(true);
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    initAuth();

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    connectionError,
    signIn: async (email, password) => {
      /* ... your signIn logic ... */
    },
    signUp: async (email, password, username) => {
      /* ... your signUp logic ... */
    },
    signOut: async () => {
      await authService.signOut();
      setUser(null);
    },
    isAuthenticated: !!user,
    setUser,
  };

  // Memoize the context value to prevent unnecessary re-renders
  const memoizedValue = React.useMemo(
    () => value,
    [user, loading, connectionError]
  );

  if (connectionError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to connect to the server. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={memoizedValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
