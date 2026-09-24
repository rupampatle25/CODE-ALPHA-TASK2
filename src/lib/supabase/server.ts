import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Checks if Supabase credentials are configured in environment variables.
 * Enables graceful fallback to the local file/memory database when running offline
 * or during evaluation without external credentials.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.startsWith('http') && 
    serviceRoleKey && 
    serviceRoleKey.length > 20
  );
}

let serverClientInstance: SupabaseClient | null = null;

/**
 * Server-side administrative Supabase client for route handlers.
 * Uses the Service Role Key to bypass RLS for verified backend operations.
 * NEVER exposed to frontend browser code.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serverClientInstance;
}
