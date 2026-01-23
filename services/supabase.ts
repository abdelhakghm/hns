
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvpbpufevbmpbekxgjzi.supabase.co';
const supabaseAnonKey = 'sb_publishable_Fv0lSfiKj8aH5xc50fmhEg_kTj2PsIE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
