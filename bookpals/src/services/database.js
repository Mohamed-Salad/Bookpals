import { supabase } from "./supabaseClient";

// Individual function exports
export const getUser = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const createProfile = async (userId, username) => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      username,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createPreferences = async (userId, preferences) => {
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: userId,
      ...preferences,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getPreferences = async (userId) => {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const updatePreferences = async (userId, updates) => {
  const { data, error } = await supabase
    .from("user_preferences")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createCommunity = async (communityData) => {
  const { data, error } = await supabase
    .from("communities")
    .insert(communityData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getCommunities = async () => {
  const { data, error } = await supabase.from("communities").select("*");
  if (error) throw error;
  return data;
};

export const getCommunity = async (communityId) => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();
  if (error) throw error;
  return data;
};

export const joinCommunity = async (communityId, userId) => {
  const { data, error } = await supabase.from("community_members").insert({
    community_id: communityId,
    user_id: userId,
  });
  if (error) throw error;
  return data;
};

export const leaveCommunity = async (communityId, userId) => {
  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);
  if (error) throw error;
};

// Service groupings
export const profileService = {
  getProfile,
  updateProfile,
  createProfile,
};

export const preferencesService = {
  getPreferences,
  updatePreferences,
  createPreferences,
};

// Default export with all functions
const databaseService = {
  getUser,
  createProfile,
  getProfile,
  updateProfile,
  createPreferences,
  getPreferences,
  updatePreferences,
  createCommunity,
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
};

export default databaseService;
