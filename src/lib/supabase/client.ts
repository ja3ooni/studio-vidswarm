
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // This warning will appear in the browser console if vars are not set,
  // or in the server console during build if these files are imported server-side.
  console.warn('Supabase client-side SDK not initialized due to missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Some features may not work.');
}

// Export the instance, which might be null if env vars are missing.
// Components using this should handle the possibility of a null client.
export const supabase = supabaseInstance;
