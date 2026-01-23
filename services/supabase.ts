
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvpbpufevbmpbekxgjzi.supabase.co';
const supabaseAnonKey = 'sb_publishable_Fv0lSfiKj8aH5xc50fmhEg_kTj2PsIE';

/**
 * Supabase Client Configured for HNS Academic Security.
 * All requests will now respect Row Level Security (RLS).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
