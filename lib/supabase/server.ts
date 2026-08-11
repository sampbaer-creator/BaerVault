import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./config";

export function createServerSupabaseClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createClient(url, publishableKey, {
    accessToken: async () => (await auth()).getToken(),
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
