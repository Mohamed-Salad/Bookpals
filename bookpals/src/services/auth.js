import { supabase } from "./supabaseClient";
import { createProfile } from "./database";

// Rate limiting configuration
const RATE_LIMIT = {
  signIn: { attempts: 5, window: 5 * 60 * 1000 }, // 5 attempts per 5 minutes
  signUp: { attempts: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
};

// Track login attempts
const loginAttempts = new Map();

// Individual function exports
export const signUp = async (email, password, username) => {
  try {
    checkRateLimit("signUp");

    // Password strength validation
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
      },
    });

    if (authError) throw authError;

    // Create profile after successful signup
    if (authData.user) {
      await createProfile(authData.user.id, username);
    }

    return authData;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    checkRateLimit("signIn");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Reset login attempts on successful login
    loginAttempts.delete("signIn");

    return data;
  } catch (error) {
    console.error("Signin error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear any stored sensitive data
    localStorage.removeItem("user_preferences");
  } catch (error) {
    console.error("Signout error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/auth/reset-password`,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const updatePassword = async (newPassword) => {
  try {
    // Password strength validation
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};

export const refreshSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Refresh session error:", error);
    throw error;
  }
};

export const signInWithProvider = async (provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Social signin error:", error);
    throw error;
  }
};

// Helper function for rate limiting
export const checkRateLimit = (action) => {
  const now = Date.now();
  const limit = RATE_LIMIT[action];
  const attempts = loginAttempts.get(action) || { count: 0, timestamp: now };

  if (now - attempts.timestamp > limit.window) {
    attempts.count = 0;
    attempts.timestamp = now;
  }

  attempts.count++;
  loginAttempts.set(action, attempts);

  if (attempts.count > limit.attempts) {
    throw new Error(`Too many attempts. Please try again later.`);
  }
};

// Default export with all functions
const authService = {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  resetPassword,
  updatePassword,
  refreshSession,
  checkRateLimit,
  signInWithProvider,
};

export default authService;
