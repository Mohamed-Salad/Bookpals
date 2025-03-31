import { supabase } from './supabaseClient';

// Profile Management
export const createProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        username: profileData.username,
        reading_type: profileData.readingType,
        interests: profileData.interests,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: profileData.username,
      reading_type: profileData.readingType,
      interests: profileData.interests,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Community Management
export const createCommunity = async (communityData) => {
  const { data, error } = await supabase
    .from('communities')
    .insert([
      {
        name: communityData.name,
        description: communityData.description,
        genre: communityData.genre,
        reading_type: communityData.readingType,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const joinCommunity = async (communityId, userId) => {
  const { data, error } = await supabase
    .from('community_members')
    .insert([
      {
        community_id: communityId,
        user_id: userId,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCommunities = async () => {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserCommunities = async (userId) => {
  const { data, error } = await supabase
    .from('community_members')
    .select(`
      community_id,
      communities (
        id,
        name,
        description,
        genre,
        reading_type
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(item => item.communities);
};

// Discussion Management
export const createDiscussion = async (discussionData) => {
  const { data, error } = await supabase
    .from('discussions')
    .insert([
      {
        community_id: discussionData.communityId,
        user_id: discussionData.userId,
        content: discussionData.content,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCommunityDiscussions = async (communityId) => {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      profiles (
        username
      )
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}; 