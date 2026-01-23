
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables
const getEnv = (key: string) => {
  try {
    return (process?.env?.[key] as string) || '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// A valid project URL must start with https and contain .supabase.co
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && 
  supabaseUrl.includes('.supabase.co')
);

/**
 * Supabase client initialization.
 * Uses robust placeholders to prevent 'supabaseUrl is required' crash even if variables are empty strings.
 */
const finalUrl = isSupabaseConfigured ? supabaseUrl : 'https://missing-project.supabase.co';
const finalKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.missing';

export const supabase = createClient(finalUrl, finalKey);

if (!isSupabaseConfigured) {
  console.log("HNS Companion: Running in Local Mode (Offline). Add SUPABASE_URL and SUPABASE_ANON_KEY to Vercel Settings to enable Cloud Sync.");
}
