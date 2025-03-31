import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
        supabaseUrl,
        supabaseAnonKey
    });
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
    signUp: async (signUpData) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: signUpData.email,
                password: signUpData.password
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Signup error:', error);
            return { data: null, error };
        }
    },

    signIn: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Signin error:', error);
            return { data: null, error };
        }
    },

    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Signout error:', error);
            return { error };
        }
    },

    getCurrentUser: async () => {
        try {
            // First, log the current session state
            const session = supabase.auth.getSession();
            console.log('Current Session:', session);

            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Detailed Get User Error:', error);
                // Log more context about the error
                console.log('Error Code:', error.code);
                console.log('Error Message:', error.message);
            }

            return { data: user, error };
        } catch (error) {
            console.error('Unexpected Get User Error:', error);
            return { data: null, error };
        }
    },

    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Database helper functions
export const database = {
    checkUsername: async (username) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username')
                .eq('username', username)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                throw error;
            }
            return { data, error: null };
        } catch (error) {
            console.error('Check username error:', error);
            return { data: null, error };
        }
    },

    upsertProfile: async (userId, profileData) => {
        try {
            if (!userId || !profileData.username || !profileData.reading_type || !profileData.interests) {
                throw new Error('Missing required profile data');
            }

            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    username: profileData.username,
                    reading_type: profileData.reading_type,
                    interests: profileData.interests,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Upsert profile error:', error);
            return { data: null, error };
        }
    },

    getProfile: async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                throw error;
            }
            return { data, error: null };
        } catch (error) {
            console.error('Get profile error:', error);
            return { data: null, error };
        }
    },

    upsertPreferences: async (userId, preferencesData) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const { data, error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: userId,
                    reading_time: preferencesData.reading_time || null,
                    reading_format: preferencesData.reading_format || null,
                    favorite_authors: preferencesData.favorite_authors || [],
                    reading_goals: preferencesData.reading_goals || null,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Upsert preferences error:', error);
            return { data: null, error };
        }
    },

    getPreferences: async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                throw error;
            }
            return { data, error: null };
        } catch (error) {
            console.error('Get preferences error:', error);
            return { data: null, error };
        }
    }
}; 