import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabasePublishableDefaultKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Browser client — uses anon key, for use in Next.js client components
export const browserClient = createClient(supabaseUrl, supabasePublishableDefaultKey);

// Server client — uses service role key, bypasses RLS
// Use only in API routes and server components
export const serverClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
