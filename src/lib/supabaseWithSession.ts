/**
 * Supabase client helper with session ID header
 * This ensures RLS policies based on x-session-id header work correctly
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getSessionId } from '@/hooks/useSessionId';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a Supabase client with the session ID header pre-configured
 * This is needed because RLS policies check the x-session-id header
 */
export const getSupabaseWithSession = () => {
  const sessionId = getSessionId();
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-session-id': sessionId,
      },
    },
  });
};
