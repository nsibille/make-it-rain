import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Client Supabase serveur (RSC & Server Actions).
 * IMPORTANT (CLAUDE.md §7bis) : recréer à CHAQUE requête — ne jamais
 * mettre en cache un client global côté serveur. La session (cookie)
 * porte auth.uid() ; la RLS s'applique donc identiquement au client.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : le refresh de session est
            // porté par le middleware. Sans danger d'ignorer ici.
          }
        },
      },
    },
  );
}
