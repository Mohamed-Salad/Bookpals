import { supabase } from "./supabaseClient";

export const CRAFTS = [
  "writer",
  "illustrator",
  "poet",
  "translator",
  "editor",
  "narrator",
];

export const getCreatorProfile = async (userId) => {
  const { data, error } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertCreatorProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("creator_profiles")
    .upsert({ user_id: userId, ...updates })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Directory listing, optionally filtered. Genre filtering happens
// client-side against each creator's works since genres live on works,
// not creator_profiles - fine at this scale (no pagination anywhere yet).
export const getCreators = async ({ craft, genre } = {}) => {
  let query = supabase
    .from("creator_profiles")
    .select(
      "*, profile:profiles!user_id(id, username, avatar_url, bio), works(id, title, cover_url, genres)"
    );
  if (craft) query = query.contains("craft", [craft]);

  const { data, error } = await query;
  if (error) throw error;

  let creators = data || [];
  if (genre) {
    creators = creators.filter((c) =>
      c.works?.some((w) => w.genres?.includes(genre))
    );
  }
  return creators;
};

export const getWorksByCreator = async (creatorId) => {
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const createWork = async (creatorId, work) => {
  const { data, error } = await supabase
    .from("works")
    .insert({ creator_id: creatorId, ...work })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateWork = async (workId, updates) => {
  const { data, error } = await supabase
    .from("works")
    .update(updates)
    .eq("id", workId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteWork = async (workId) => {
  const { error } = await supabase.from("works").delete().eq("id", workId);
  if (error) throw error;
  return true;
};

// Mirrors the avatar-upload pattern in database.js updateProfilePicture.
export const uploadWorkCover = async (userId, file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("work-covers")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("work-covers").getPublicUrl(fileName);
  return data.publicUrl;
};
