import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

import { getSupabaseConfig } from "./config";

export const createServerSupabaseClient = cache(() => {
  const { url, publishableKey } = getSupabaseConfig();

  return createClient(url, publishableKey, {
    accessToken: async () => {
      const clerkAuth = await auth();
      try {
        const supabaseToken = await clerkAuth.getToken({ template: "supabase" });
        if (supabaseToken) return supabaseToken;
      } catch {
        // The first-class Clerk/Supabase integration uses the normal session token.
      }
      return clerkAuth.getToken();
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
});
