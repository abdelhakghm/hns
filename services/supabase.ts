
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Ensure these values are correct in your Supabase Dashboard
// The Anon Key usually starts with 'eyJ...'
const supabaseUrl = 'https://fvpbpufevbmpbekxgjzi.supabase.co';
const supabaseAnonKey = 'sb_publishable_Fv0lSfiKj8aH5xc50fmhEg_kTj2PsIE';

/**
 * Supabase Client Configured for HNS Academic Security.
 * All requests respect Row Level Security (RLS).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage // Explicitly use localStorage for persistence
  }
});

// Helper to check if the client is potentially misconfigured
export const isSupabaseConfigured = !!supabaseUrl && supabaseAnonKey.startsWith('eyJ');
