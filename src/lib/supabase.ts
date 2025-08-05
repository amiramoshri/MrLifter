import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey;

if (!hasSupabaseConfig) {
  console.warn('Missing Supabase environment variables. Some features may not work.');
}

// Create Supabase client only if config is available
export const supabase = hasSupabaseConfig 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return hasSupabaseConfig && supabase !== null;
};

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  if (!isSupabaseAvailable()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseAvailable()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseAvailable()) {
    return { error: new Error('Supabase not configured') };
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!isSupabaseAvailable()) {
    return { user: null, error: new Error('Supabase not configured') };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};