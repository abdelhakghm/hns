
import { createClient } from '@supabase/supabase-js';

// Environment variables from Vercel/Local
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if we have a valid configuration
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://missing-url.supabase.co');

/**
 * Supabase client initialization.
 * Uses placeholders if environment variables are missing to prevent total app crash.
 */
const finalUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(finalUrl, finalKey);

if (!isSupabaseConfigured) {
  console.log("HNS Companion: Running in Local Mode (No Supabase keys detected). Progress will be saved to browser storage.");
}
