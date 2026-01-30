
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Ensure these values are correct in your Supabase Dashboard.
// If your Anon Key starts with 'sb_publishable_', ensure your project settings are updated.
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
    storage: window.localStorage // Explicitly use localStorage for cross-session persistence
  }
});

/**
 * Validates whether the Supabase client is likely to function.
 * Check this in components if users report 'Access Denied' errors.
 */
export const isSupabaseConfigured = !!supabaseUrl && (supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_'));
