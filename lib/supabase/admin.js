import { createClient } from '@supabase/supabase-js';

// This admin client is for use in server-side environments like API routes or server actions
// where the request context (and thus `next/headers`) is not available.
// It uses the service role key for elevated privileges, so it should never be exposed to the client.

export function createSupabaseAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
        // This error will be thrown if the server-side environment variables are not set.
        throw new Error('Supabase URL or Supabase secret key is not defined in environment variables.');
    }

    // Create and return a new admin client for server-side use.
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
