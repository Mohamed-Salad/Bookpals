import { supabase } from '../config/supabaseConfig';
import { UserProfile } from '../config/supabaseConfig';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export const authService = {
  /**
   * Sign up a new user
   * @param email - User's email address
   * @param password - User's password
   * @param username - User's chosen username
   * @returns Promise with user data or error
   */
  async signUp(email: string, password: string, username: string): Promise<AuthResponse> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Create user profile in database
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            username,
            reading_preferences: [],
            favorite_books: [],
            bio: '',
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        user: profileData,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during sign up',
        },
      };
    }
  },

  /**
   * Log in an existing user
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with user data or error
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: profileData,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during login',
        },
      };
    }
  },

  /**
   * Log out the current user
   * @returns Promise with success or error
   */
  async logout(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during logout',
        },
      };
    }
  },

  /**
   * Get the current user's session
   * @returns Promise with current session or error
   */
  async getCurrentSession(): Promise<AuthResponse> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (!session?.user) {
        return { user: null, error: null };
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: profileData,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: {
          message: error instanceof Error ? error.message : 'An error occurred while getting session',
        },
      };
    }
  },
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Failed to sign in' };
  }
};

export const signUpWithEmail = async (email: string, password: string, username: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: username });
    return { user, error: null };
  } catch (error) {
    console.error('Error signing up with email:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Failed to sign up' };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { user, error: null };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Failed to sign in' };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error instanceof Error ? error.message : 'Failed to sign out' };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 