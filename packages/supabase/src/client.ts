import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabasePublishableDefaultKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Guard: supabase-js throws if URL is empty. Use a placeholder URL during
// module loading so the import chain doesn't break. The client will fail
// at first actual request if real env vars are missing, which is the correct
// place to surface that error.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const anonKey = supabasePublishableDefaultKey || 'placeholder';
const serviceKey = supabaseServiceKey || 'placeholder';

// Browser client — uses anon key, for use in Next.js client components
export const browserClient = createClient(url, anonKey);

// Server client — uses service role key, bypasses RLS
// Use only in API routes and server components
export const serverClient = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
