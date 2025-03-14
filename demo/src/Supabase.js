import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
    // Sign up a new user
    signUp: async (signUpData) => {
        console.log('Attempting signup with:', signUpData); // Debug log
        const { data, error } = await supabase.auth.signUp(signUpData);
        console.log('Signup response:', { data, error }); // Debug log
        return { data, error };
    },

    // Sign in user
    signIn: async (email, password) => {
        console.log('Attempting signin with email:', email); // Debug log
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        console.log('Signin response:', { data, error }); // Debug log
        return { data, error };
    },

    // Sign out user
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current user
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },
};

// Database helper functions
export const database = {
    // Profile functions
    upsertProfile: async (userId, profileData) => {
        console.log('Upserting profile for user:', userId, profileData);
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        console.log('Upsert response:', { data, error });
        return { data, error };
    },

    getProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },

    // Community functions
    createCommunity: async (communityData) => {
        const { data, error } = await supabase
            .from('communities')
            .insert(communityData)
            .select()
            .single();
        return { data, error };
    },

    getCommunities: async () => {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .order('member_count', { ascending: false });
        return { data, error };
    },

    joinCommunity: async (communityId, userId) => {
        const { data, error } = await supabase
            .from('community_members')
            .insert({
                community_id: communityId,
                user_id: userId
            })
            .select()
            .single();

        if (!error) {
            // Increment member count
            await supabase.rpc('increment_member_count', { community_id: communityId });
        }

        return { data, error };
    },

    leaveCommunity: async (communityId, userId) => {
        const { error } = await supabase
            .from('community_members')
            .delete()
            .match({ community_id: communityId, user_id: userId });

        if (!error) {
            // Decrement member count
            await supabase.rpc('decrement_member_count', { community_id: communityId });
        }

        return { error };
    },

    // User connection functions
    connectWithUser: async (userId, connectedUserId) => {
        const { data, error } = await supabase
            .from('user_connections')
            .insert({
                user_id: userId,
                connected_user_id: connectedUserId
            })
            .select()
            .single();
        return { data, error };
    },

    getUserConnections: async (userId) => {
        const { data, error } = await supabase
            .from('user_connections')
            .select(`
                connected_user_id,
                connected_users:profiles!user_connections_connected_user_id_fkey(*)
            `)
            .eq('user_id', userId);
        return { data, error };
    },

    // Recommendation functions
    getRecommendations: async (userId) => {
        const { data: userProfile, error: profileError } = await database.getProfile(userId);
        if (profileError) return { data: null, error: profileError };

        // Get users with similar interests
        const { data: similarUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', userId)
            .contains('interests', userProfile.interests)
            .eq('reading_type', userProfile.reading_type)
            .limit(5);

        // Get matching communities
        const { data: communities, error: communitiesError } = await supabase
            .from('communities')
            .select('*')
            .contains('genre', userProfile.interests)
            .eq('reading_type', userProfile.reading_type)
            .limit(5);

        return {
            data: {
                users: similarUsers || [],
                communities: communities || []
            },
            error: usersError || communitiesError
        };
    }
};

export default supabase;
