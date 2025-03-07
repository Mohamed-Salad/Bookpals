import { createClient } from '@supabase/supabase-js';

// Define environment variables type
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Initialize Supabase client
const supabaseConfig: SupabaseConfig = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
};

// Create Supabase client instance
export const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey
);

// Database types
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  bio: string;
  reading_preferences: string[];
  favorite_books: string[];
  reading_goals: string[];
  created_at: string;
  updated_at: string;
}

export interface ReadingGroup {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  members: string[];
  genre: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  group_id?: string;
}

// Export types for use in other files
export type { SupabaseConfig }; 