
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Supabase URL not found. Please set SUPABASE_URL in your .env file.');
  // In a real app, you might throw an error or handle this more gracefully
}
if (!supabaseServiceRoleKey) {
  console.error('SupABASE Service Role Key not found. Please set SUPABASE_SERVICE_ROLE_KEY in your .env file.');
}

// Create a single supabase client for server-side operations
// Ensure this is only initialized if the variables are present, to avoid errors during build
let supabaseAdminInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
} else {
  console.warn("Supabase admin client not initialized due to missing environment variables.");
}


export const supabaseAdmin = supabaseAdminInstance;
