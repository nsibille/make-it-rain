import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Client Supabase navigateur (Client Components).
 * La session vit dans les cookies (gérés par @supabase/ssr) ;
 * la RLS s'applique via auth.uid() porté par cette session.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
