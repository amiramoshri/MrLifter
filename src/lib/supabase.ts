import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey;

if (!hasSupabaseConfig) {
  console.warn('Missing Supabase environment variables. Some features may not work.');
}

// Global fetch interceptor to handle JWT expiration
const globalFetch = (url: RequestInfo | URL, options?: RequestInit) => {
  return fetch(url, options).then(async (response) => {
    // Check for JWT expired errors
    if ((response.status === 401 || response.status === 403) && response.headers.get('content-type')?.includes('application/json')) {
      try {
        const errorBody = await response.clone().json();
        if (errorBody.message?.includes('JWT expired') || 
            errorBody.message?.includes('token is expired') ||
            errorBody.code === 'PGRST301' ||
            errorBody.code === 'bad_jwt') {
          console.warn('JWT expired, signing out user');
          // Sign out the user when JWT is expired
          if (supabase) {
            await supabase.auth.signOut();
          }
        }
      } catch (e) {
        // If we can't parse the error body, continue with original response
      }
    }
    return response;
  });
};

// Create Supabase client only if config is available
export const supabase = hasSupabaseConfig 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        fetch: globalFetch
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