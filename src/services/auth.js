import { supabase } from "./supabaseClient";
import { createProfile } from "./database";
import { streamClient } from "./streamClient";

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
    // First disconnect from chat if connected
    if (streamClient.userID) {
      console.log("📤 Disconnecting from chat before logout");
      await streamClient.disconnectUser();
    }

    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear any stored sensitive data
    localStorage.removeItem("user_preferences");
    console.log("✅ Successfully signed out and disconnected from chat");
  } catch (error) {
    console.error("❌ Signout error:", error);
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

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
  });
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw error;
  return data;
};

export const handleAuthCallback = async () => {
  try {
    console.log("[Auth] Processing auth callback");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("[Auth] Error getting session:", error);
      throw error;
    }

    if (!session) {
      console.error("[Auth] No session found in callback");
      throw new Error("No session found");
    }

    const { user } = session;
    console.log(`[Auth] User authenticated: ${user.id}`);

    // Check if user already has a profile
    console.log(`[Auth] Checking if profile exists for user ${user.id}`);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // Only log if it's not a "not found" error
      console.error("[Auth] Error checking profile:", profileError);
    }

    // If no profile, create one with data from OAuth
    if (!profile) {
      console.log(`[Auth] No profile found for user ${user.id}, creating one`);
      const username =
        user.user_metadata?.preferred_username ||
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        `user_${Math.random().toString(36).substring(2, 8)}`;

      console.log(`[Auth] Creating profile with username: ${username}`);
      try {
        await createProfile(user.id, username);
        console.log(`[Auth] Profile created successfully for ${user.id}`);
      } catch (createError) {
        console.error("[Auth] Error creating profile:", createError);
        // Continue anyway since the user is authenticated
      }
    } else {
      console.log(`[Auth] Existing profile found for user ${user.id}`);
    }

    return { user, session };
  } catch (error) {
    console.error("[Auth] Error in auth callback:", error);
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

export const deleteUser = async (userId) => {
  try {
    // First, delete the user's profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) throw profileError;

    // Then, delete the user from the auth system
    // This requires admin rights and should be done via a secure server-side function
    // Here we're adding the client-side part, but you'll need to set up a serverless function
    // to securely delete the user from auth.users
    console.log("User profile deleted. User ID:", userId);
    console.log(
      "To completely remove the user, you need to delete them from the auth system via the Supabase dashboard or using admin API."
    );

    return { success: true, message: "User profile deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

// Default export with all functions for backward compatibility
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
  signInWithGithub,
  signInWithGoogle,
  handleAuthCallback,
  deleteUser,
};

export default authService;
