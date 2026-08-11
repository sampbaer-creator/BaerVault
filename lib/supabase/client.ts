"use client";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./config";

export function createBrowserSupabaseClient(getToken: () => Promise<string | null>) {
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, { accessToken: getToken });
}
