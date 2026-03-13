import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/integrations/supabase/env";

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowserClient = () => {
  const supabaseEnv = getSupabaseEnv();

  if (!supabaseEnv) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseEnv.url, supabaseEnv.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  return browserClient;
};
